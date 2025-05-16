const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'db_library'
});

connection.connect(function (error) {
	if (!!error) {
		console.log(error);
	} else {
		console.log('Conectado..!');
	}
});

module.exports = connection;