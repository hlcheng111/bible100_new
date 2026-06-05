/**
 * Smart Ministry Data Linking Manager
 * 智慧事奉数据联动管理器
 * 版本: v1.0
 */

(function(window) {
    'use strict';

    class SmartMinistryLinking {
        constructor() {
            this.storageKey = 'smart_ministry_linking';
            this.linkingData = this.load();
        }

        load() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : { links: {} };
            } catch (e) {
                return { links: {} };
            }
        }

        save() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.linkingData));
                return true;
            } catch (e) {
                console.error('保存失败:', e);
                return false;
            }
        }

        link(type, sourceId, targetId, metadata = {}) {
            const key = `${type}_${sourceId}_${targetId}`;
            if (this.linkingData.links[key]) return false;

            this.linkingData.links[key] = {
                type: type,
                sourceId: sourceId,
                targetId: targetId,
                createdAt: new Date().toISOString(),
                metadata: metadata
            };

            this.save();
            return true;
        }

        unlink(type, sourceId, targetId = null) {
            if (targetId === null) return this.unlinkAll(type, sourceId);

            const key = `${type}_${sourceId}_${targetId}`;
            if (this.linkingData.links[key]) {
                delete this.linkingData.links[key];
                this.save();
                return true;
            }
            return false;
        }

        unlinkAll(type, sourceId) {
            let count = 0;
            Object.keys(this.linkingData.links).forEach(key => {
                const link = this.linkingData.links[key];
                if (link.type === type && link.sourceId === sourceId) {
                    delete this.linkingData.links[key];
                    count++;
                }
            });
            
            if (count > 0) this.save();
            return count;
        }

        getAllLinks(type = null) {
            const links = Object.values(this.linkingData.links);
            return type ? links.filter(l => l.type === type) : links;
        }

        getLinkedItems(type, sourceId, db, targetTable) {
            const links = this.getAllLinks(type).filter(l => l.sourceId === sourceId);
            const items = [];
            
            links.forEach(link => {
                const records = db.select(targetTable, { id: link.targetId });
                if (records && records.length > 0) {
                    items.push(records[0]);
                }
            });
            
            return items;
        }

        clearAll(confirm = false) {
            if (!confirm) return false;
            
            const backup = JSON.stringify(this.linkingData);
            localStorage.setItem(this.storageKey + '_backup_' + Date.now(), backup);
            
            this.linkingData = { links: {} };
            this.save();
            return true;
        }

        exportData() {
            return JSON.stringify(this.linkingData, null, 2);
        }
    }

    window.SmartMinistryLinking = SmartMinistryLinking;
    console.log('📦 Smart Ministry Data Linking 已加载');

})(window);


















