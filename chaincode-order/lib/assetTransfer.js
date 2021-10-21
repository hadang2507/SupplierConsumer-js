/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const Orders = [
            {
                ID: 'O1',
                Name: 'Order1',
                Type: 'Order',
                Contains:['P1','P2'],
                Issuer: 'Retailer',
                Owner: 'Retailer',
                shippingStatus:'Shipping',
                transferTo: 'Retailer'
            },
            {
                ID: 'O2',
                Name: 'Order2',
                Type: 'Order',
                Contains:['P3','P2'],
                Issuer: 'Retailer',
                Owner: 'Retailer',
                shippingStatus:'Requested',
                transferTo: 'Retailer'
            },
            {
                ID: 'O3',
                Name: 'Order3',
                Type: 'Order',
                Contains:['P1','P2','P3'],
                Issuer: 'Retailer',
                Owner: 'Retailer',
                shippingStatus:'Shipped',
                transferTo: 'Retailer'
            },
            {
                ID: 'O4',
                Name: 'Order4',
                Type: 'Order',
                Contains:['P1','P2','P3'],
                Issuer: 'Retailer',
                Owner: 'Retailer',
                shippingStatus:'Requested',
                transferTo: 'Retailer'
            },
            {
                ID: 'O5',
                Name: 'Order5',
                Type: 'Order',
                Contains:['P4','P2'],
                Issuer: 'Retailer',
                Owner: 'Retailer',
                shippingStatus:'Shipping',
                transferTo: 'Retailer'
            },
        ];

        for (const Order of Orders) {
            Order.docType = 'Order';
            await ctx.stub.putState(Order.ID, Buffer.from(JSON.stringify(Order)));
            console.info(`Order ${Order.ID} initialized`);
        }
    }

    // CreateOrder issues a new Order to the world state with given details.
    async CreateOrder(ctx, id, Name, Type,Contains,Issuer, Owner,shippingStatus, transferTo) {
        Contains= Contains.split(',');
        const Order = {
            ID: id,
            Name: Name,
            Type: Type,
            Contains:Contains,
            Issuer: Issuer,
            Owner: Owner,
            shippingStatus:shippingStatus,
            transferTo: transferTo
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(Order)));
        return JSON.stringify(Order);
    }

    // ReadOrder returns the Order stored in the world state with given id.
    async ReadOrder(ctx, id) {
        const OrderJSON = await ctx.stub.getState(id); // get the Order from chaincode state
        if (!OrderJSON || OrderJSON.length === 0) {
            throw new Error(`The Order ${id} does not exist`);
        }
        return OrderJSON.toString();
    }

    // UpdateOrder updates an existing Order in the world state with provided parameters.
    async UpdateOrder(ctx, id, Name, Type, Contains, Issuer, Owner,shippingStatus, transferTo) {
        const exists = await this.OrderExists(ctx, id);
        if (!exists) {
            throw new Error(`The Order ${id} does not exist`);
        }

        // overwriting original Order with new Order
        Contains= Contains.split(',');
        const updatedOrder = {
            ID: id,
            Name: Name,
            Type: Type,
            Contains:Contains,
            Issuer: Issuer,
            Owner: Owner,
            shippingStatus:shippingStatus,
            transferTo: transferTo
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedOrder)));
    }

    // DeleteOrder deletes an given Order from the world state.
    async DeleteOrder(ctx, id) {
        const exists = await this.OrderExists(ctx, id);
        if (!exists) {
            throw new Error(`The Order ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // OrderExists returns true when Order with given ID exists in world state.
    async OrderExists(ctx, id) {
        const OrderJSON = await ctx.stub.getState(id);
        return OrderJSON && OrderJSON.length > 0;
    }

    // TransferOrder updates the owner field of Order with given id in the world state.
    async TransferOrder(ctx, id, newOwner) {
        const OrderString = await this.ReadOrder(ctx, id);
        const Order = JSON.parse(OrderString);
        Order.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(Order)));
    }

    // Get query result from query string
    async GetQueryResultForQueryString(ctx, queryString) {
		const allResults = [];
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let result = await resultsIterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await resultsIterator.next();
        }
        return JSON.stringify(allResults);
	}

    async QueryOrdersByShippingStatus(ctx, shippingStatus) {
		let queryString = {};
		queryString.selector = {};
		queryString.selector.shippingStatus = shippingStatus;
		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

    // GetAllOrders returns all Orders found in the world state.
    async GetAllOrders(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all Orders in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    // GetOrderHistory returns history of the Order.
    async GetOrderHistory(ctx,id){
        const allResults = [];
        const iterator = await ctx.stub.getHistoryForKey(id);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;