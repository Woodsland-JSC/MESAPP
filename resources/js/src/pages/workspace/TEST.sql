CREATE VIEW "TEST01_WOODSLAND"."UV_SOLUONGTON" 
(
	"U_GRID",
	"U_To",
	"U_Next",
	"U_CDOAN",
	"ItemCode",
	"ItemName",
	"U_SPDICH",
	"SubItemCode",
	"SubItemName",
	"wareHouse",
	"OnHand",
	"OnHandTo",
	"BaseQty"
) AS 
SELECT
	T40."U_GRID",
	T40."U_To",
	T40."U_Next",
	T40."U_CDOAN",
	T40."ItemCode",
	T40."ItemName",
	T40."U_SPDICH",
	T40."SubItemCode",
	T41."SubItemName",
	T40."wareHouse",
	T40."OnHand",
	IFNULL(T41."Quantiy", 0) AS "OnHandTo", 
	T40."BaseQty"
FROM 
	(
		SELECT
			T0."U_GRID",
			T0."U_To",
			T0."U_Next",
			T0."U_CDOAN",
			T0."ItemCode" AS "FatherCode",
			T0."ProdName" AS "FatherName",
			T0."U_SPDICH",
			T1."ItemCode",
			T1."wareHouse",
			SUM(T2."OnHand") AS "OnHand",
			T1."BaseQty"
		FROM 
			"OWOR" T0 
		INNER JOIN 
			"WOR1" T1 ON T0."DocEntry" = T1."DocEntry" 
		INNER JOIN 
			"OITW" T2 ON T1."ItemCode" = T2."ItemCode" 
		INNER JOIN 
			"OITM" T3 ON T1."ItemCode" = T3."ItemCode" AND T1."wareHouse" = T2."WhsCode" 
		WHERE 
			T3."ItmsGrpCod" IN (101,102)
		GROUP BY 
			T0."U_GRID",
			T0."U_To",
			T0."U_Next",
			T0."U_CDOAN",
			T0."ItemCode",
			T0."ProdName",
			T0."U_SPDICH",
			T1."ItemCode",
			T1."wareHouse",
			"BaseQty"
	) T40 
LEFT JOIN 
	(
		SELECT
			"U_To",
			"ItemCode",
			"ItemName",
			SUM("Quantiy") AS "Quantiy"
		FROM 
			(
				SELECT
					T02."U_To",
					T01."ItemCode",
					T01."Dscription" AS "ItemName",
					T01."Quantity" AS "Quantiy"
				FROM 
					"OIGN" T00 
				INNER JOIN 
					"IGN1" T01 ON T00."DocEntry" = T01."DocEntry" 
				INNER JOIN 
					"OWOR" T02 ON T01."BaseEntry" = T02."DocEntry" AND T01."BaseType" = 202 
				UNION ALL 
				SELECT
					T02."U_To",
					T01."ItemCode",
					T01."Dscription" AS "ItemName",
					T01."Quantity" * (-1) AS "Quantiy"
				FROM 
					"OIGE" T00 
				INNER JOIN 
					"IGE1" T01 ON T00."DocEntry" = T01."DocEntry" 
				INNER JOIN 
					"OWOR" T02 ON T01."BaseEntry" = T02."DocEntry" AND T01."BaseType" = 202
			) T10 
		GROUP BY 
			T10."U_To",
			T10."ItemCode",
			T10."ItemName"
	) T41 ON T40."U_To" = T41."U_To" AND T40."ItemCode" = T41."ItemCode" 
WITH READ ONLY;