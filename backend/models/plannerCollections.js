const mongoose = require('mongoose');

const plannerCollectionSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    type : {type : String, required : true},
    collectionData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const PlannerCollections = mongoose.model('plannerCollections', plannerCollectionSchema, 'plannerCollections');

module.exports = {PlannerCollections};

/*

type : [shopping, food, watchlist, reading, wishlist, todo, trip, notepad]


collectionData :

shopping :
[
    {name, quantity, checked}
]

food :
[
    {name, type, link}
]

watchlist :
[
    {name, type, rating, checked, category}
]

reading :
[
    {name, type, checked, notes}
]

wishlist :
[
    {name, priority, checked}
]

todo :
[
    {name, priority, due, checked}
]

trip :
[
    {name, notes, checked}
]

notepad :
{
    data,
    updatedAt
}

*/