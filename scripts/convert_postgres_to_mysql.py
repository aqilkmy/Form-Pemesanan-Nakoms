import re
import os
import json

def convert_array_to_json(sql_line):
    # Matches ARRAY[...]
    # Need to be careful because elements can have commas inside or quotes
    def replacer(match):
        inner = match.group(1)
        # extract quoted strings inside ARRAY[...]
        # elements are like 'item1', 'item2'
        items = re.findall(r"'((?:''|[^'])*)'", inner)
        cleaned_items = [item.replace("''", "'") for item in items]
        json_str = json.dumps(cleaned_items)
        # escape single quotes for SQL: ' -> ''
        escaped_json = json_str.replace("'", "''")
        return f"'{escaped_json}'"
    
    return re.sub(r"ARRAY\[(.*?)\]", replacer, sql_line)

def convert_sql_statement(line, table_name):
    # Replace "public"."table_name" with `table_name`
    line = re.sub(r'"public"\."' + table_name + r'"', f"`{table_name}`", line)
    
    # Replace double quoted column names ("col1", "col2") with `col1`, `col2` in INSERT INTO header
    def quote_cols(match):
        header = match.group(0)
        return header.replace('"', '`')
    
    line = re.sub(r'INSERT INTO `' + table_name + r'` \((.*?)\)', quote_cols, line)
    
    # Convert ARRAY[...] to JSON
    line = convert_array_to_json(line)
    
    # Convert timestamp +00
    line = re.sub(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\+00", r"\1", line)
    
    return line

def generate_mysql_dump():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backup_dir = os.path.join(base_dir, "BackupDB")
    out_file = os.path.join(backup_dir, "hostinger_full_import.sql")
    
    schema_ddl = """-- ==============================================================================
-- FORM PEMESANAN NAKOMS (RIZZMED) - BEM UNSOED 2026
-- MYSQL SCHEMA & DATA IMPORT FOR HOSTINGER
-- Database: u256329210_rismedorder
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- 1. DROP TABLES IF EXISTS (CLEAN REBUILD)
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `pj_mappings`;
DROP TABLE IF EXISTS `pj_contacts`;

-- ==============================================================================
-- 2. TABLE: pj_contacts
-- ==============================================================================
CREATE TABLE `pj_contacts` (
  `id` VARCHAR(36) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `nomor` VARCHAR(50) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `role` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_pj_contacts_nama` (`nama`),
  INDEX `idx_pj_contacts_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TABLE: pj_mappings
-- ==============================================================================
CREATE TABLE `pj_mappings` (
  `id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `lookup_key` VARCHAR(255) NOT NULL,
  `pj_id` VARCHAR(36) NULL,
  `platforms` JSON NULL,
  `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pj_mappings_category_lookup_key_unique` (`category`, `lookup_key`),
  INDEX `idx_pj_mappings_category` (`category`),
  INDEX `idx_pj_mappings_pj_id` (`pj_id`),
  CONSTRAINT `fk_pj_mappings_pj_id` FOREIGN KEY (`pj_id`) REFERENCES `pj_contacts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. TABLE: orders
-- ==============================================================================
CREATE TABLE `orders` (
  `id` VARCHAR(36) NOT NULL,
  `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `nama` VARCHAR(255) NOT NULL,
  `kementerian` VARCHAR(255) NOT NULL,
  `nomor_whatsapp` VARCHAR(50) NOT NULL,
  `sudah_baca_sop` BOOLEAN DEFAULT FALSE,
  `judul_desain` TEXT NULL,
  `platform_publikasi` JSON NULL,
  `tanggal_publikasi` DATE NULL,
  `waktu_publikasi` VARCHAR(100) NULL,
  `link_thumbnail` TEXT NULL,
  `link_file_konten` TEXT NULL,
  `link_caption_docs` TEXT NULL,
  `request_lagu` TEXT NULL,
  `custom_shortlink` TEXT NULL,
  `fitur_tambahan_web` TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'new',
  `link_desain_selesai` TEXT NULL,
  `menu_type` VARCHAR(50) NOT NULL,
  `catatan_website` TEXT NULL,
  `nama_kegiatan` TEXT NULL,
  `tanggal_kegiatan` DATE NULL,
  `waktu_kegiatan` VARCHAR(100) NULL,
  `tempat_kegiatan` TEXT NULL,
  `jenis_bantuan` VARCHAR(100) NULL,
  `jenis_bantuan_lainnya` TEXT NULL,
  `judul_survey` TEXT NULL,
  `deskripsi_survey` LONGTEXT NULL,
  `target_responden` TEXT NULL,
  `deadline_survey` DATE NULL,
  `link_gdrive_brief` TEXT NULL,
  `hadiah_survey` TEXT NULL,
  `status_publikasi` JSON NULL,
  `tujuan_pemesanan` TEXT NULL,
  `link_original` TEXT NULL,
  `link_pengajuan_fitur` TEXT NULL,
  `link_pendaftaran_event` TEXT NULL,
  `is_hidden` BOOLEAN DEFAULT FALSE,
  `website_sub_type` VARCHAR(50) NULL,
  `judul_kampanye` TEXT NULL,
  `nama_url_twibbon` TEXT NULL,
  `caption_twibbon` LONGTEXT NULL,
  `format_twibbon` VARCHAR(50) NULL,
  `warna_chroma_key` VARCHAR(50) NULL,
  `tanggal_publikasi_twibbon` DATE NULL,
  `link_asset_twibbon` TEXT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_menu_type` (`menu_type`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created_at` (`created_at`),
  INDEX `idx_orders_kementerian` (`kementerian`),
  INDEX `idx_orders_tanggal_publikasi` (`tanggal_publikasi`),
  INDEX `idx_orders_tanggal_kegiatan` (`tanggal_kegiatan`),
  INDEX `idx_orders_tanggal_publikasi_twibbon` (`tanggal_publikasi_twibbon`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. DATA INSERTS
-- ==============================================================================

"""

    with open(out_file, "w", encoding="utf-8") as out:
        out.write(schema_ddl)
        
        # 1. Process pj_contacts
        pj_contacts_file = os.path.join(backup_dir, "pj_contacts_rows (1).sql")
        if os.path.exists(pj_contacts_file):
            print("Processing pj_contacts...")
            out.write("\n-- DATA: pj_contacts\n")
            with open(pj_contacts_file, "r", encoding="utf-8") as f:
                content = f.read()
                converted = convert_sql_statement(content, "pj_contacts")
                out.write(converted)
                if not converted.strip().endswith(";"):
                    out.write(";\n")
                else:
                    out.write("\n")
        
        # 2. Process pj_mappings
        pj_mappings_file = os.path.join(backup_dir, "pj_mappings_rows (1).sql")
        if os.path.exists(pj_mappings_file):
            print("Processing pj_mappings...")
            out.write("\n-- DATA: pj_mappings\n")
            with open(pj_mappings_file, "r", encoding="utf-8") as f:
                content = f.read()
                converted = convert_sql_statement(content, "pj_mappings")
                out.write(converted)
                if not converted.strip().endswith(";"):
                    out.write(";\n")
                else:
                    out.write("\n")

        # 3. Process orders
        orders_file = os.path.join(backup_dir, "orders_rows (2).sql")
        if os.path.exists(orders_file):
            print("Processing orders...")
            out.write("\n-- DATA: orders\n")
            with open(orders_file, "r", encoding="utf-8") as f:
                content = f.read()
                converted = convert_sql_statement(content, "orders")
                out.write(converted)
                if not converted.strip().endswith(";"):
                    out.write(";\n")
                else:
                    out.write("\n")
                    
        out.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")

    print(f"Generated hostinger_full_import.sql successfully at {out_file}")

if __name__ == "__main__":
    generate_mysql_dump()
