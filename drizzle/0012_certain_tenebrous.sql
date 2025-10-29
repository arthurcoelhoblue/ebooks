CREATE TABLE `ebookFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`languageCode` varchar(5) NOT NULL,
	`epubUrl` text,
	`pdfUrl` text,
	`coverUrl` text,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebookFiles_id` PRIMARY KEY(`id`)
);
