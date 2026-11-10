// Napravljeno komandom: npm run db:types (iz migracija u supabase/migrations). Ne menjati ručno.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "categories": {
                  Row: {
                    "id": number,"item_type": Database["public"]['Enums']["item_type"],"name": string,"parent_id": number | null,"position": number,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: never,"item_type": Database["public"]['Enums']["item_type"],"name": string,"parent_id"?: number | null,"position"?: number,"slug": string
                  }
                  Update: {
                    "id"?: never,"item_type"?: Database["public"]['Enums']["item_type"],"name"?: string,"parent_id"?: number | null,"position"?: number,"slug"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"conversations": {
                  Row: {
                    "buyer_id": string,"created_at": string,"id": string,"last_message_at": string,"listing_id": number,"seller_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "buyer_id": string,"created_at"?: string,"id"?: string,"last_message_at"?: string,"listing_id": number,"seller_id": string
                  }
                  Update: {
                    "buyer_id"?: string,"created_at"?: string,"id"?: string,"last_message_at"?: string,"listing_id"?: number,"seller_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_buyer_id_fkey"
      columns: ["buyer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_buyer_id_fkey"
      columns: ["buyer_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    },{
      foreignKeyName: "conversations_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversations_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"favorites": {
                  Row: {
                    "created_at": string,"listing_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"listing_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"listing_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"genres": {
                  Row: {
                    "id": number,"item_type": Database["public"]['Enums']["item_type"],"name": string,"position": number,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: never,"item_type": Database["public"]['Enums']["item_type"],"name": string,"position"?: number,"slug": string
                  }
                  Update: {
                    "id"?: never,"item_type"?: Database["public"]['Enums']["item_type"],"name"?: string,"position"?: number,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"help_articles": {
                  Row: {
                    "body": string,"created_at": string,"helpful_no": number,"helpful_yes": number,"id": number,"position": number,"published": boolean,"section": Database["public"]['Enums']["help_section"],"slug": string,"title": string,"topic": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string,"created_at"?: string,"helpful_no"?: number,"helpful_yes"?: number,"id"?: never,"position"?: number,"published"?: boolean,"section": Database["public"]['Enums']["help_section"],"slug": string,"title": string,"topic": string,"updated_at"?: string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"helpful_no"?: number,"helpful_yes"?: number,"id"?: never,"position"?: number,"published"?: boolean,"section"?: Database["public"]['Enums']["help_section"],"slug"?: string,"title"?: string,"topic"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"listing_images": {
                  Row: {
                    "created_at": string,"id": number,"listing_id": number,"path": string,"position": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"listing_id": number,"path": string,"position": number
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"listing_id"?: number,"path"?: string,"position"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_images_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    }
                  ]
                },"listings": {
                  Row: {
                    "attributes": NonNullable<Json>,"author": string | null,"bundle_count": number,"category_id": number,"city": string | null,"condition": Database["public"]['Enums']["item_condition"],"condition_note": string | null,"created_at": string,"description": string | null,"genre_id": number | null,"id": number,"isbn": string | null,"item_type": Database["public"]['Enums']["item_type"],"language": string | null,"page_count": number | null,"payment_methods": (Database["public"]['Enums']["payment_method"])[],"price_rsd": number,"publisher": string | null,"reserved_at": string | null,"search": unknown,"seller_id": string,"shipping_methods": (Database["public"]['Enums']["shipping_method"])[],"sold_at": string | null,"sold_to": string | null,"status": Database["public"]['Enums']["listing_status"],"status_check_sent_at": string | null,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attributes"?: NonNullable<Json>,"author"?: string | null,"bundle_count"?: number,"category_id": number,"city"?: string | null,"condition": Database["public"]['Enums']["item_condition"],"condition_note"?: string | null,"created_at"?: string,"description"?: string | null,"genre_id"?: number | null,"id"?: never,"isbn"?: string | null,"item_type": Database["public"]['Enums']["item_type"],"language"?: string | null,"page_count"?: number | null,"payment_methods"?: (Database["public"]['Enums']["payment_method"])[],"price_rsd": number,"publisher"?: string | null,"reserved_at"?: string | null,"search"?: never,"seller_id": string,"shipping_methods"?: (Database["public"]['Enums']["shipping_method"])[],"sold_at"?: string | null,"sold_to"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"status_check_sent_at"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "attributes"?: NonNullable<Json>,"author"?: string | null,"bundle_count"?: number,"category_id"?: number,"city"?: string | null,"condition"?: Database["public"]['Enums']["item_condition"],"condition_note"?: string | null,"created_at"?: string,"description"?: string | null,"genre_id"?: number | null,"id"?: never,"isbn"?: string | null,"item_type"?: Database["public"]['Enums']["item_type"],"language"?: string | null,"page_count"?: number | null,"payment_methods"?: (Database["public"]['Enums']["payment_method"])[],"price_rsd"?: number,"publisher"?: string | null,"reserved_at"?: string | null,"search"?: never,"seller_id"?: string,"shipping_methods"?: (Database["public"]['Enums']["shipping_method"])[],"sold_at"?: string | null,"sold_to"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"status_check_sent_at"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listings_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_genre_id_fkey"
      columns: ["genre_id"]
isOneToOne: false
      referencedRelation: "genres"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    },{
      foreignKeyName: "listings_sold_to_fkey"
      columns: ["sold_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_sold_to_fkey"
      columns: ["sold_to"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "body": string,"conversation_id": string,"created_at": string,"id": number,"read_at": string | null,"sender_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"conversation_id": string,"created_at"?: string,"id"?: never,"read_at"?: string | null,"sender_id": string
                  }
                  Update: {
                    "body"?: string,"conversation_id"?: string,"created_at"?: string,"id"?: never,"read_at"?: string | null,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "created_at": string,"data": NonNullable<Json>,"id": number,"read_at": string | null,"type": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"data"?: NonNullable<Json>,"id"?: never,"read_at"?: string | null,"type": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"data"?: NonNullable<Json>,"id"?: never,"read_at"?: string | null,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"bio": string | null,"city": string | null,"created_at": string,"display_name": string,"id": string,"is_admin": boolean,"ships_within_days": number | null,"updated_at": string,"username": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"bio"?: string | null,"city"?: string | null,"created_at"?: string,"display_name": string,"id": string,"is_admin"?: boolean,"ships_within_days"?: number | null,"updated_at"?: string,"username": string
                  }
                  Update: {
                    "avatar_url"?: string | null,"bio"?: string | null,"city"?: string | null,"created_at"?: string,"display_name"?: string,"id"?: string,"is_admin"?: boolean,"ships_within_days"?: number | null,"updated_at"?: string,"username"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reports": {
                  Row: {
                    "created_at": string,"details": string | null,"id": number,"listing_id": number | null,"reason": string,"reported_user_id": string | null,"reporter_id": string,"resolved_at": string | null,"resolved_by": string | null,"status": Database["public"]['Enums']["report_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details"?: string | null,"id"?: never,"listing_id"?: number | null,"reason": string,"reported_user_id"?: string | null,"reporter_id": string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"]
                  }
                  Update: {
                    "created_at"?: string,"details"?: string | null,"id"?: never,"listing_id"?: number | null,"reason"?: string,"reported_user_id"?: string | null,"reporter_id"?: string,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["report_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reported_user_id_fkey"
      columns: ["reported_user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reported_user_id_fkey"
      columns: ["reported_user_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    },{
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    },{
      foreignKeyName: "reports_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "comment": string | null,"created_at": string,"id": number,"listing_id": number,"rating": number,"reviewer_id": string,"seller_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "comment"?: string | null,"created_at"?: string,"id"?: never,"listing_id": number,"rating": number,"reviewer_id": string,"seller_id": string
                  }
                  Update: {
                    "comment"?: string | null,"created_at"?: string,"id"?: never,"listing_id"?: number,"rating"?: number,"reviewer_id"?: string,"seller_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: true
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_reviewer_id_fkey"
      columns: ["reviewer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_reviewer_id_fkey"
      columns: ["reviewer_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    },{
      foreignKeyName: "reviews_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_seller_id_fkey"
      columns: ["seller_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                },"saved_searches": {
                  Row: {
                    "category_id": number | null,"created_at": string,"filters": NonNullable<Json>,"id": number,"name": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id"?: number | null,"created_at"?: string,"filters"?: NonNullable<Json>,"id"?: never,"name": string,"user_id": string
                  }
                  Update: {
                    "category_id"?: number | null,"created_at"?: string,"filters"?: NonNullable<Json>,"id"?: never,"name"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "saved_searches_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "saved_searches_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "saved_searches_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "seller_stats"
      referencedColumns: ["seller_id"]
    }
                  ]
                }
          }
          Views: {
            "seller_stats": {
                  Row: {
                    "for_sale_count": number | null,"positive_pct": number | null,"rating_avg": number | null,"review_count": number | null,"seller_id": string,"sold_count": number | null
                  }
                  ComputedFields: never
                  Insert: {
                           "for_sale_count"?: never,"positive_pct"?: never,"rating_avg"?: never,"review_count"?: never,"seller_id"?: string | null,"sold_count"?: never
                         }
                        Update: {
                           "for_sale_count"?: never,"positive_pct"?: never,"rating_avg"?: never,"review_count"?: never,"seller_id"?: string | null,"sold_count"?: never
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "can_review":
{ Args: { "p_listing": number,"p_seller": string }; Returns: boolean
                           },
"f_unaccent":
{ Args: { "": string }; Returns: string
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_conversation_participant":
{ Args: { "conv": string }; Returns: boolean
                           },
"send_status_checks":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"username_available":
{ Args: { "p_username": string }; Returns: boolean
                           },
"vote_help_article":
{ Args: { "p_article": number,"p_helpful": boolean }; Returns: undefined
                           }
          }
          Enums: {
            "help_section": "kupovina"|"prodaja"|"nalog","item_condition": "novo"|"kao_novo"|"vrlo_dobro"|"dobro"|"zadovoljavajuce","item_type": "knjiga"|"muzika"|"igra"|"manga_strip"|"oprema","listing_status": "dostupno"|"rezervisano"|"prodato"|"uklonjen","payment_method": "tekuci_racun"|"pouzece"|"gotovina","report_status": "otvorena"|"resena"|"odbacena","shipping_method": "posta"|"licno"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "help_section": ["kupovina", "prodaja", "nalog"],"item_condition": ["novo", "kao_novo", "vrlo_dobro", "dobro", "zadovoljavajuce"],"item_type": ["knjiga", "muzika", "igra", "manga_strip", "oprema"],"listing_status": ["dostupno", "rezervisano", "prodato", "uklonjen"],"payment_method": ["tekuci_racun", "pouzece", "gotovina"],"report_status": ["otvorena", "resena", "odbacena"],"shipping_method": ["posta", "licno"]
          }
        }
} as const
