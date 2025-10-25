CREATE TABLE `ebookMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`optimizedTitle` varchar(255),
	`shortDescription` text,
	`longDescription` text,
	`keywords` text,
	`categories` text,
	`suggestedPrice` varchar(50),
	`targetAudience` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebookMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`totalEbooks` int NOT NULL,
	`generatedCount` int NOT NULL DEFAULT 0,
	`themeMode` enum('custom_list','single_theme','trending') NOT NULL,
	`themes` text,
	`singleTheme` text,
	`author` varchar(255) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
