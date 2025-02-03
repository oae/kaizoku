CREATE TABLE `kaizoku_sessions` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`user_id` text(21) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `kaizoku_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kaizoku_users` (
	`id` text(21) PRIMARY KEY NOT NULL,
	`user_name` text(255) NOT NULL,
	`email` text(255) NOT NULL,
	`avatar` text(2000) NOT NULL,
	`hashed_password` text(255) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `kaizoku_sessions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `kaizoku_users_user_name_unique` ON `kaizoku_users` (`user_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `kaizoku_users_email_unique` ON `kaizoku_users` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `kaizoku_users` (`email`);