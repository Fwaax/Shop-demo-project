export interface IFEUser {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    inventory: {
        itemId: string,
        quantity: number,
    }[],
    balance: number,
}

export interface IFEItem {
    _id: string,
    name: string,
    description: string,
    imageUrl: string,
    quantity: number,
    price: number
    from: string,
    to: string,
}

export interface ITransferHistory {
    itemId: ObjectId;
    quantity: number;
    fromUserID: ObjectId;
    toUserID: ObjectId;
    totalCost: number;
    dateInUnix: number;
}

export interface IPopulatedTransferHistory {
    _id: string; // ID of the transfer history entry
    itemId: {
        _id: string; // ID of the item
        name: string; // Name of the item
        description: string; // Description of the item
        imageUrl: string; // URL of the item's image
    };
    quantity: number; // Quantity of items transferred
    fromUserID: {
        _id: string; // ID of the sender
        firstName: string; // Sender's first name
        lastName: string; // Sender's last name
        email: string; // Sender's email
    };
    toUserID: {
        _id: string; // ID of the recipient
        firstName: string; // Recipient's first name
        lastName: string; // Recipient's last name
        email: string; // Recipient's email
    };
    totalCost: number; // Total cost of the transfer
    dateInUnix: number; // Date of the transfer in Unix timestamp format
}
