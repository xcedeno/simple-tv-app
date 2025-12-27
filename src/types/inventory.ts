export interface InventoryItem {
    id?: string;
    item_number: number;
    equipment_type: string;
    room_number: string;
    model: string;
    serial_number: string;
    asset_number: string;
    is_smart_tv: boolean;
    created_at?: string;
}
