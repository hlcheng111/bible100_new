/**
 * Core Directory
 * 核心資料目錄（跨模組共用）
 *
 * 目標：
 * - 提供 people / courses / organizations 的「全域 ID 與基本資料」
 * - 各事工模組（school / church / bible_study / disciple_dynamics 等）只存「模組特有欄位」＋對應 coreId
 *
 * 階段 B：僅建立骨架與資料結構，不強制整合各模組，方便日後逐步接上。
 */

(function (window) {
    'use strict';

    class CoreDirectory {
        constructor(storageKey = 'CoreDirectoryDB') {
            this.storageKey = storageKey;
            this.data = this.load() || this.initializeDefaultStructure();
        }

        load() {
            try {
                const json = localStorage.getItem(this.storageKey);
                return json ? JSON.parse(json) : null;
            } catch (e) {
                console.warn('CoreDirectory 載入失敗，將重新初始化:', e);
                return null;
            }
        }

        save() {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        }

        initializeDefaultStructure() {
            this.data = {
                // 人員主檔（無論是學生／老師／教會會友／聖經學員，都共用一個 peopleId）
                people: [],

                // 課程主檔（可被學校課程、教會課程、門徒訓練等共用）
                courses: [],

                // 組織主檔（總校、多分校、本地教會、區域中心等）
                organizations: [],

                // 系統元資料
                metadata: {
                    version: '0.1.0',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };
            this.save();
            return this.data;
        }

        // ===== 通用輔助 =====

        _ensureArray(key) {
            if (!this.data[key]) {
                this.data[key] = [];
            }
            return this.data[key];
        }

        _generateId() {
            return Date.now() + Math.floor(Math.random() * 1000);
        }

        // ===== People =====

        /**
         * 新增或更新 people
         * 建議欄位：
         * - nameZh / nameEn / nameVi
         * - gender / birthDate
         */
        upsertPerson(person) {
            if (!person) throw new Error('person is required');
            const list = this._ensureArray('people');

            if (person.id) {
                const index = list.findIndex(p => p.id === person.id);
                if (index !== -1) {
                    list[index] = {
                        ...list[index],
                        ...person,
                        updatedAt: new Date().toISOString()
                    };
                    this.save();
                    return list[index];
                }
            }

            const newPerson = {
                id: person.id || this._generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...person
            };
            list.push(newPerson);
            this.save();
            return newPerson;
        }

        getPersonById(id) {
            const list = this._ensureArray('people');
            return list.find(p => p.id === id) || null;
        }

        // ===== Courses =====

        /**
         * 新增或更新 course
         * 建議欄位：
         * - codeGlobal：跨模組通用代碼（例如 BIBLE101）
         * - titleZh / titleEn / titleVi
         */
        upsertCourse(course) {
            if (!course) throw new Error('course is required');
            const list = this._ensureArray('courses');

            if (course.id) {
                const index = list.findIndex(c => c.id === course.id);
                if (index !== -1) {
                    list[index] = {
                        ...list[index],
                        ...course,
                        updatedAt: new Date().toISOString()
                    };
                    this.save();
                    return list[index];
                }
            }

            const newCourse = {
                id: course.id || this._generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...course
            };
            list.push(newCourse);
            this.save();
            return newCourse;
        }

        getCourseById(id) {
            const list = this._ensureArray('courses');
            return list.find(c => c.id === id) || null;
        }

        // ===== Organizations =====

        /**
         * 新增或更新 organization
         * 建議欄位：
         * - type: 'school' | 'church' | 'center'
         * - parentId: 形成總校／分校層級
         */
        upsertOrganization(org) {
            if (!org) throw new Error('organization is required');
            const list = this._ensureArray('organizations');

            if (org.id) {
                const index = list.findIndex(o => o.id === org.id);
                if (index !== -1) {
                    list[index] = {
                        ...list[index],
                        ...org,
                        updatedAt: new Date().toISOString()
                    };
                    this.save();
                    return list[index];
                }
            }

            const newOrg = {
                id: org.id || this._generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...org
            };
            list.push(newOrg);
            this.save();
            return newOrg;
        }

        getOrganizationById(id) {
            const list = this._ensureArray('organizations');
            return list.find(o => o.id === id) || null;
        }
    }

    // 建立全域單例，方便各模組取用
    window.coreDirectory = window.coreDirectory || new CoreDirectory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CoreDirectory;
    }
})(window);

