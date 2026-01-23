import { Order } from "#entities";

interface ShippingAddress {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
}

const mockShippingAddress: ShippingAddress = {
    name: "John Doe",
    address: "123 Main St",
    city: "Anytown",
    zipCode: "12345",
    country: "USA",
}

export const formatOrderDto = (order: Order) => {
    return {
        id: order.id,
        userId: order.user?.id,
        status: order.status,

        items: order.items?.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.priceAtPurchase,
            name: item.product.name,
            image: item.product.images[0],
            description: item.product.description,
        })),
        total: order.totalAmount,
        date: order.updatedAt,

        // TODO: get shipping address from user
        shippingAddress: mockShippingAddress
    };
};