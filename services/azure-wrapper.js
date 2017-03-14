var azure = require('azure-storage');

var exports = module.exports;

//exports.azure = azure;

var AzureBlobService = azure.createBlobService();
//exports.AzureBlobService = AzureBlobService;

var AzureQueueService = azure.createQueueService();
//exports.AzureQueueService = AzureQueueService;

var AzureTableService = azure.createTableService();
//exports.AzureTableService = AzureTableService;

exports.createBoxFileFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
    return AzureBlobService.createBlockBlobFromLocalFile(container, blob, localFileName, optionsOrCallback, callback);
};

exports.createMessage = function (queue, messageText, callback) {
    return AzureQueueService.createMessage(queue, messageText, callback);
};

exports.getItemsList = function (tableName, itemLimit, callback) {
       /*
    //https://docs.microsoft.com/en-us/azure/storage/storage-nodejs-how-to-use-table-storage
    //http://stackoverflow.com/questions/40468960/easiest-way-to-map-azure-table-storage-data-model-in-node-js
    //http://stackoverflow.com/questions/34334433/transform-response-from-azure-table-storage-with-node
    //https://github.com/Azure-Samples/storage-table-node-getting-started
    //https://docs.microsoft.com/en-us/rest/api/storageservices/fileservices/query-entities
    tableSvc.createTableIfNotExists('multicloud', function (error, result, response) {
        if (!error) {
            // Table exists or created
        }
    });

    var entGen = cloudWrp.azure.TableUtilities.entityGenerator;
    var task = {
        PartitionKey: entGen.String('hometasks'),
        RowKey: entGen.String('1'),
        description: entGen.String('take out the trash'),
        inserted: entGen.DateTime(new Date()),
    };
    var task2 = {
  PartitionKey: {'_':'hometasks'},
  RowKey: {'_': '2'},
  description: {'_':'Wash the dishes'},
  dueDate: {'_':new Date(2015, 6, 20)}
};

    tableSvc.insertEntity('multicloud', task, function (error, result, response) {
        if (!error) {
            // Entity inserted
        }
    });
    
    */
    var options = {
        payloadFormat: 'application/json;odata=nometadata'
    };
    
     var query = new azure.TableQuery().top(itemLimit);

     return AzureTableService.queryEntities(tableName, query, null, options, callback);   
};