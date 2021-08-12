'use strict';

const databaseManager = require('./dynamoDbManager');
const uuidv1 = require('uuid/v1');
const tableName = process.env.SAMPLE_TABLE;

exports.candidates = async (event) => {
	console.log(event);

	switch (event.httpMethod) {
		case 'DELETE':
			return deleteItem(event);
		case 'GET':
			return getItem(event);
		case 'POST':
			return saveItem(event);
		case 'PUT':
			return updateItem(event);
		default:
			return sendResponse(404, `Unsupported method "${event.httpMethod}"`);
	}
};

function saveItem(event) {
	const item = JSON.parse(event.body);
	item.itemId = uuidv1();

	return databaseManager.saveItem(item).then(response => {
		console.log(response);
		return sendResponse(200, item.itemId);
	});
}

 function getItem(event) {
	if (event && event.path.indexOf('getAll')){
		return databaseManager.getAll().then(response => {
			response.map(res => {
				res['id'] = res.itemId
				delete res.itemId
			})
			return sendResponse(200, JSON.stringify(response));
		});



	}
	else
	{
		const itemId = event.pathParameters.itemId ;

		return databaseManager.getItem(itemId).then(response => {
			return sendResponse(200, JSON.stringify(response));
		});
	}



}

function deleteItem(event) {
	const itemId = event.pathParameters.itemId;

	return databaseManager.deleteItem(itemId).then(response => {
		return sendResponse(200, 'Item has been successfully deleted ITEM');
	});
}

function updateItem(event) {
	const itemId = event.pathParameters.itemId;

	const body = JSON.parse(event.body);
	const paramName = body.paramName;
	const paramValue = body.paramValue;

	return databaseManager.updateItem(itemId, paramName, paramValue).then(response => {
		console.log(response);
		return sendResponse(200, JSON.stringify(response));
	});
}

function sendResponse(statusCode, message) {
	const response = {
		statusCode: statusCode,
		// contentType:'application/json',
		headers: {
			"Access-Control-Allow-Headers" : "Content-Type",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "OPTIONS,POST,GET"
		},
		// body: {message}
		body: JSON.stringify(message)

	};
	return response
}
