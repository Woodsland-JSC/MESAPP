<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RunSQL1415 extends Command
{
    protected $signature = 'sql:run-second';
    protected $description = 'Run the second SQL command at 16:15';

    public function handle()
    {
        DB::statement(`
            ALTER VIEW "WOODSLAND"."UV_SOLUONGTON" ( "U_GRID", "U_To", "U_Next", "U_CDOAN", "U_SPDICH", "ItemCode", "ItemName", "SubItemCode", "SubItemName", "wareHouse", "OnHand", "OnHandTo", "BaseQty" ) AS SELECT
            T40."U_GRID",
            T40."U_To",
            T40."U_Next",
            T40."U_CDOAN",
            T40."U_SPDICH",
            T40."ItemCode",
            T40."ItemName",
            T40."SubItemCode",
            T40."SubItemName",
            T40."wareHouse",
            T40."OnHand",
            IFNULL(T41."Quantiy",
            0) AS "OnHandTo",
            T40."BaseQty" 
            FROM ( SELECT
            T0."U_GRID",
            T0."U_To",
            T0."U_Next",
            T0."U_CDOAN",
            T0."U_SPDICH",
            T0."ItemCode" AS "ItemCode",
            T0."ProdName" AS "ItemName",
            T1."ItemCode" AS "SubItemCode",
            T3."ItemName" AS "SubItemName",
            T1."wareHouse",
            SUM(T2."OnHand") AS "OnHand",
            T1."BaseQty" 
            FROM "OWOR" T0 
            INNER JOIN "WOR1" T1 ON T0."DocEntry" = T1."DocEntry" 
            INNER JOIN "OITW" T2 ON T1."ItemCode" = T2."ItemCode" 
            INNER JOIN "OITM" T3 ON T1."ItemCode" = T3."ItemCode" 
            AND T1."wareHouse" = T2."WhsCode" 
            WHERE T3."ItmsGrpCod" IN (101,
            102) 
            AND T0."Status"='R' 
            AND T0."PlannedQty" > T0."CmpltQty" 
            GROUP BY T0."U_GRID",
            T0."U_To",
            T0."U_Next",
            T0."U_CDOAN",
            T0."U_SPDICH",
            T0."ItemCode",
            T0."ProdName",
            T1."ItemCode",
            T3."ItemName",
            T1."wareHouse",
            "BaseQty" ) T40 
        LEFT JOIN ( SELECT
            "U_To",
            "SubItemCode",
            "SubItemName",
            SUM("Quantiy") AS "Quantiy" 
            FROM ( SELECT
            T02."U_To",  
            T01."ItemCode" AS "SubItemCode",
            T01."Dscription" AS "SubItemName",
            T01."Quantity" AS "Quantiy" 
                FROM "OIGN" T00 
                INNER JOIN "IGN1" T01 ON T00."DocEntry" = T01."DocEntry" 
                INNER JOIN "OWOR" T02 ON T01."BaseEntry" = T02."DocEntry" 
                AND T01."BaseType" = 202 
                WHERE T02."Status"='R' 
                AND T02."PlannedQty" > T02."CmpltQty" 
                UNION ALL SELECT
            T02."U_To",
            T01."ItemCode" AS "SubItemCode",
            T01."Dscription" AS "SubItemName",
            T01."Quantity" * (-1) AS "Quantiy" 
                FROM "OIGE" T00 
                INNER JOIN "IGE1" T01 ON T00."DocEntry" = T01."DocEntry" 
                INNER JOIN "OWOR" T02 ON T01."BaseEntry" = T02."DocEntry" 
                WHERE T02."Status"='R' 
                AND T02."PlannedQty" > T02."CmpltQty" 
                AND T01."BaseType" = 202 ) T10 
            GROUP BY T10."U_To",
            T10."SubItemCode",
            T10."SubItemName" ) T41 ON T40."U_To" = T41."U_To" 
        AND T40."SubItemCode" = T41."SubItemCode" WITH READ ONLY`);
        $this->info('SQL for 16:15 executed successfully.');
    }
}
