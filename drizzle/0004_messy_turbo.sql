CREATE TABLE `publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`platform` enum('amazon_kdp','hotmart','eduzz','monetizze') NOT NULL,
	`published` int NOT NULL DEFAULT 1,
	`publicationUrl` text,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publications_id` PRIMARY KEY(`id`)
);
