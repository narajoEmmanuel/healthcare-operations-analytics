"""Shared environment and SQL helpers."""

from __future__ import annotations

import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def load_environment() -> None:
    load_dotenv(PROJECT_ROOT / ".env")


def connect():
    """Connect without constructing or logging a password-bearing URL."""
    return psycopg.connect(
        dbname=os.environ["POSTGRES_DB"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        host=os.environ.get("POSTGRES_HOST", "127.0.0.1"),
        port=os.environ.get("POSTGRES_PORT", "5432"),
    )


def execute_sql_file(connection, relative_path: str) -> None:
    sql = (PROJECT_ROOT / relative_path).read_text(encoding="utf-8")
    connection.execute(sql)
