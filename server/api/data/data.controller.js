'use strict';

var _ = require('lodash');
var query = require('pg-query');
var util = require('util');

// Get number of measurement records
exports.index = function(req, res) {
  query.first('SELECT count(*) FROM data_value', function (err, result) {
    if(!err){
      res.json(
        result
      );
    } else {
      res.status(503).send(
        err
      );
    }
  });
};

exports.hourlyAvgForDay = function(req, res) {  
  req.checkQuery('day', 'Invalid date!').isDate();
  req.checkQuery('station', 'Invalid station!').isInt();
  req.checkQuery('height', 'Invalid sensor height!').isInt();
  req.checkQuery('measuredescr', 'Invalid measurement description!').isAlpha;
  req.checkQuery('senstypedescr', 'Invalid sensor type description!').isAlpha();
  
  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
  }
  
    var day = req.query.day;
    var station = req.query.station;
    var height = req.query.height;
    var measdescr = req.query.measuredescr;
    var senstypedescr = req.query.senstypedescr;
    
  query("SELECT date_trunc('hour', data_value.timestamp) as tick, avg(data_value.value) as value \
FROM data_value, sensor, measurement_description, sensor_type \
WHERE data_value.sensor_id = sensor.sensor_id \
AND data_value.measurement_description_id = measurement_description.measurement_description_id \
AND sensor_type.sensor_type_id = sensor.sensor_type_id \
AND data_value.timestamp BETWEEN $1::timestamp \
AND $1::timestamp + time '23:59:59' AND sensor.station_id = $2::int \
AND sensor.height = $3::int \
AND sensor_type.description = $4::text \
AND measurement_description.type = $5::text \
GROUP BY 1 ORDER BY 1 ASC", [day, station, height, senstypedescr, measdescr], function (err, rows, result) {
    //checks errors in the connection to the db
    if(!err){
        res.json(
            rows
        );
    } else {
        res.status(503).send(
            err
        );
    }
  });
};

exports.hourlyAvgForDay3Sites = function(req, res) {
    var day = req.query.day;
    var height = req.query.height;
    var measdescr = req.query.measuredescr;
    var senstypedescr = req.query.senstypedescr;
    
    /* the query can be a sum of queries, use „UNION“ and for every column that  is missed in one query but needed in another query add in the SELECT part: „null as <missed_column_name>“
    */
    
    query("SELECT tick , sum(value1) as value1, sum(value2) as value2, sum(value3) as value3 \
          FROM ( \
SELECT date_trunc('hour', data_value.timestamp) as tick, avg(data_value.value) as value1, null::numeric as value2, null::numeric as value3 \
FROM data_value, sensor, measurement_description, sensor_type \
WHERE data_value.sensor_id = sensor.sensor_id \
AND data_value.measurement_description_id = measurement_description.measurement_description_id \
AND sensor_type.sensor_type_id = sensor.sensor_type_id \
AND data_value.timestamp BETWEEN $1::timestamp AND $1::timestamp + time '23:59:59' \
AND sensor.station_id = 3 \
AND sensor.height = $2::int \
AND sensor_type.description = $3::text \
AND measurement_description.type = $4::text \
GROUP BY 1 \
UNION SELECT date_trunc('hour', data_value.timestamp) as tick, null::numeric as value1, avg(data_value.value) as value2, null::numeric as value3 \
FROM data_value, sensor, measurement_description, sensor_type \
WHERE data_value.sensor_id = sensor.sensor_id \
AND data_value.measurement_description_id = measurement_description.measurement_description_id \
AND sensor_type.sensor_type_id = sensor.sensor_type_id \
AND data_value.timestamp BETWEEN $1::timestamp AND $1::timestamp + time '23:59:59' \
AND sensor.station_id = 1 \
AND sensor.height = $2::int \
AND sensor_type.description = $3::text \
AND measurement_description.type = $4::text \
GROUP BY 1 \
UNION SELECT date_trunc('hour', data_value.timestamp) as tick, null::numeric as value1, null::numeric as value2, avg(data_value.value) as value3 \
FROM data_value, sensor, measurement_description, sensor_type \
WHERE data_value.sensor_id = sensor.sensor_id \
AND data_value.measurement_description_id = measurement_description.measurement_description_id \
AND sensor_type.sensor_type_id = sensor.sensor_type_id \
AND data_value.timestamp BETWEEN $1::timestamp AND $1::timestamp + time '23:59:59' \
AND sensor.station_id = 2 \
AND sensor.height = $2::int \
AND sensor_type.description = $3::text \
AND measurement_description.type = $4::text \
GROUP BY 1)t \
GROUP BY 1 ORDER BY 1 ASC", [day, height, senstypedescr, measdescr], function (err, rows, result){
         //checks errors in the connection to the db
         if(!err){
             res.json(rows);
         } else {
            res.status(503).send(err);
         }
     });
 }; 