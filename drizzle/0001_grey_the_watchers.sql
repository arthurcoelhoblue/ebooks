CREATE TABLE `ebooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`theme` text NOT NULL,
	`author` varchar(255) NOT NULL,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`epubUrl` text,
	`pdfUrl` text,
	`coverUrl` text,
	`content` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publishingGuides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`platform` enum('amazon_kdp','hotmart','eduzz','monetizze') NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`checklist` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publishingGuides_id` PRIMARY KEY(`id`)
);
