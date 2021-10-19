/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const Products = [
            {
                ID: 'P1',
                Name: 'Candied Apples',
                Type: 'Product',
                madeOf:['I1','I2'],
                Issuer: 'Org2',
                Owner: 'Org2'
            },
            {
                ID: 'P2',
                Name: 'Orange Juice',
                Type: 'Product',
                madeOf:['I3','I2'],
                Issuer: 'Org2',
                Owner: 'Org2'
            },
            {
                ID: 'P3',
                Name: 'Salted Lemonade',
                Type: 'Product',
                madeOf:['I3','I4','I5','I6'],
                Issuer: 'Org2',
                Owner: 'Org2'
            },
        ];

        for (const Product of Products) {
            Product.docType = 'Product';
            await ctx.stub.putState(Product.ID, Buffer.from(JSON.stringify(Product)));
            console.info(`Product ${Product.ID} initialized`);
        }
    }

    // CreateProduct issues a new Product to the world state with given details.
    async CreateProduct(ctx, id, Name, Type, madeOf, Issuer, Owner) {
        madeOf= madeOf.split(',');
        const Product = {
            ID: id,
            Name: Name,
            Type: Type,
            madeOf: madeOf,
            Issuer: Issuer,
            Owner: Owner
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(Product)));
        return JSON.stringify(Product);
    }

    // ReadProduct returns the Product stored in the world state with given id.
    async ReadProduct(ctx, id) {
        const ProductJSON = await ctx.stub.getState(id); // get the Product from chaincode state
        if (!ProductJSON || ProductJSON.length === 0) {
            throw new Error(`The Product ${id} does not exist`);
        }
        return ProductJSON.toString();
    }

    // UpdateProduct updates an existing Product in the world state with provided parameters.
    async UpdateProduct(ctx, id, Name, Type, madeOf, Issuer, Owner) {
        const exists = await this.ProductExists(ctx, id);
        if (!exists) {
            throw new Error(`The Product ${id} does not exist`);
        }

        // overwriting original Product with new Product
        madeOf= madeOf.split(',');
        const updatedProduct = {
            ID: id,
            Name: Name,
            Type: Type,
            madeOf:madeOf,
            Issuer: Issuer,
            Owner: Owner
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedProduct)));
    }

    // DeleteProduct deletes an given Product from the world state.
    async DeleteProduct(ctx, id) {
        const exists = await this.ProductExists(ctx, id);
        if (!exists) {
            throw new Error(`The Product ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // ProductExists returns true when Product with given ID exists in world state.
    async ProductExists(ctx, id) {
        const ProductJSON = await ctx.stub.getState(id);
        return ProductJSON && ProductJSON.length > 0;
    }

    // TransferProduct updates the owner field of Product with given id in the world state.
    async TransferProduct(ctx, id, newOwner) {
        const ProductString = await this.ReadProduct(ctx, id);
        const Product = JSON.parse(ProductString);
        Product.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(Product)));
    }

    // GetAllProducts returns all Products found in the world state.
    async GetAllProducts(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all Products in the chaincode namespace.
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

    async GetQueryResultForQueryString(ctx, queryString) {
        const allResults = [];
        // Query all the result matching the "queryString" condition
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

    // Query the product by the gived product's ID
    async QueryProductsByID(ctx, ID) {
		let queryString = {};
		queryString.selector = {};
		queryString.selector.ID = ID;
		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

}


module.exports = AssetTransfer;
