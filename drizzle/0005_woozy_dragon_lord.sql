CREATE TABLE `financialMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`trafficCost` varchar(20) DEFAULT '0',
	`otherCosts` varchar(20) DEFAULT '0',
	`revenue` varchar(20) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialMetrics_id` PRIMARY KEY(`id`)
);
