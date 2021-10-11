/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const Ingredients = [
            {
                ID: 'I1',
                Name: 'Apple',
                Type: 'ingredient',
                Issuer: 'Org1',
            },
            {
                ID: 'I2',
                Name: 'Sugar',
                Type: 'ingredient',
                Issuer: 'Org1',
            },
            {
                ID: 'I3',
                Name: 'Orange',
                Type: 'ingredient',
                Issuer: 'Org1',
            },
            {
                ID: 'I4',
                Name: 'Water',
                Type: 'ingredient',
                Issuer: 'Org1',
            },
            {
                ID: 'I5',
                Name: 'Salt',
                Type: 'ingredient',
                Issuer: 'Org1',
            },
        ];

        for (const Ingredient of Ingredients) {
            Ingredient.docType = 'Ingredient';
            await ctx.stub.putState(Ingredient.ID, Buffer.from(JSON.stringify(Ingredient)));
            console.info(`Ingredient ${Ingredient.ID} initialized`);
        }
    }

    // CreateIngredient issues a new Ingredient to the world state with given details.
    async CreateIngredient(ctx, id, Name, Type, Issuer) {
        const Ingredient = {
            ID: id,
            Name: Name,
            Type: Type,
            Issuer: Issuer,
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(Ingredient)));
        return JSON.stringify(Ingredient);
    }

    // ReadIngredient returns the Ingredient stored in the world state with given id.
    async ReadIngredient(ctx, id) {
        const IngredientJSON = await ctx.stub.getState(id); // get the Ingredient from chaincode state
        if (!IngredientJSON || IngredientJSON.length === 0) {
            throw new Error(`The Ingredient ${id} does not exist`);
        }
        return IngredientJSON.toString();
    }

    // UpdateIngredient updates an existing Ingredient in the world state with provided parameters.
    async UpdateIngredient(ctx, id, Name, Type, Issuer) {
        const exists = await this.IngredientExists(ctx, id);
        if (!exists) {
            throw new Error(`The Ingredient ${id} does not exist`);
        }

        // overwriting original Ingredient with new Ingredient
        const updatedIngredient = {
            ID: id,
            Name: Name,
            Type: Type,
            Issuer: Issuer,

        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedIngredient)));
    }

    // DeleteIngredient deletes an given Ingredient from the world state.
    async DeleteIngredient(ctx, id) {
        const exists = await this.IngredientExists(ctx, id);
        if (!exists) {
            throw new Error(`The Ingredient ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // IngredientExists returns true when Ingredient with given ID exists in world state.
    async IngredientExists(ctx, id) {
        const IngredientJSON = await ctx.stub.getState(id);
        return IngredientJSON && IngredientJSON.length > 0;
    }

    // TransferIngredient updates the owner field of Ingredient with given id in the world state.
    async TransferIngredient(ctx, id, newOwner) {
        const IngredientString = await this.ReadIngredient(ctx, id);
        const Ingredient = JSON.parse(IngredientString);
        Ingredient.Owner = newOwner;
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(Ingredient)));
    }

    // GetAllIngredients returns all Ingredients found in the world state.
    async GetAllIngredients(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all Ingredients in the chaincode namespace.
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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = IngredientTransfer;
