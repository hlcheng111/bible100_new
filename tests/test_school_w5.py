# -*- coding: utf-8 -*-
"""
學校管理 W5（物業：場地／租約／維修）靜態檢查
執行：python tests/test_school_w5.py
"""
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAILURES = []


def read(rel):
    with open(os.path.join(ROOT, rel), "r", encoding="utf-8") as f:
        return f.read()


def check(name, ok):
    print(f"[{'OK  ' if ok else 'FAIL'}] {name}")
    if not ok:
        FAILURES.append(name)


def main():
    db = read("school_management/js/school-master-database.js")
    for api in (
        "property.bookings",
        "property.maintenance",
        "getRoomById(roomId)",
        "updateRoom(roomId",
        "getLeaseAlerts(daysAhead)",
        "getPropertyStats()",
        "getBookings(filter)",
        "addBooking(input)",
        "cancelBooking(bookingId)",
        "getMaintenanceTickets(filter)",
        "addMaintenanceTicket(input)",
        "updateMaintenanceStatus(ticketId",
        "ownershipType",
        "leaseExpiresAt",
    ):
        check(f"資料層：{api}", api in db)

    prop_page = read("school_management/manage/property/index.html")
    check("物業頁：addRoom", "addRoom" in prop_page)
    check("物業頁：getLeaseAlerts", "getLeaseAlerts" in prop_page)
    check("物業頁：addBooking", "addBooking" in prop_page)
    check("物業頁：addMaintenanceTicket", "addMaintenanceTicket" in prop_page)
    check("物業頁：updateMaintenanceStatus", "updateMaintenanceStatus" in prop_page)
    check("物業頁：維修狀態流", "btn-start" in prop_page and "btn-done" in prop_page)
    check("物業頁：租用類型", 'value="rented"' in prop_page)

    tabs = read("school_management/manage/property_tabs.html")
    check("物業 Tab 殼", "property/index.html" in tabs)

    sidebar = read("school_management/sidebar.html")
    check("側欄：物業入口", "property_tabs.html" in sidebar)

    dashboard = read("school_management/dashboard.html")
    check("儀表板：物業捷徑", "property_tabs.html" in dashboard)
    check("儀表板：租約提醒卡", "leaseAlertCount" in dashboard)
    check("儀表板：getPropertyStats", "getPropertyStats" in dashboard)

    courses = read("school_management/manage/courses/index.html")
    check("課程排程：教室接 getRooms", "getRooms" in courses and "scheduleRoomSelect" in courses)

    schedule = read("school_management/manage/courses/schedule.html")
    check("週課表：getRooms", "getRooms" in schedule)

    print()
    if FAILURES:
        print(f"共 {len(FAILURES)} 項失敗：")
        for f in FAILURES:
            print(" -", f)
        sys.exit(1)
    print("全部通過 ✅")


if __name__ == "__main__":
    main()
