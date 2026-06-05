/**
 * Hymn Data Linking Manager
 * 诗歌数据联动管理器
 */

(function(window) {
    'use strict';

    class HymnDataLinking {
        constructor() {
            this.storageKey = 'hymn_data_linking';
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
            localStorage.setItem(this.storageKey, JSON.stringify(this.linkingData));
        }

        link(type, sourceId, targetId, metadata = {}) {
            const key = `${type}_${sourceId}_${targetId}`;
            if (this.linkingData.links[key]) return false;

            this.linkingData.links[key] = {
                type, sourceId, targetId,
                createdAt: new Date().toISOString(),
                metadata
            };

            this.save();
            return true;
        }

        unlink(type, sourceId, targetId = null) {
            if (!targetId) return this.unlinkAll(type, sourceId);

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
            return links.map(link => {
                const items = db.select(targetTable, { id: link.targetId });
                return items && items.length > 0 ? items[0] : null;
            }).filter(item => item);
        }
    }

    window.HymnDataLinking = HymnDataLinking;
    console.log('📦 Hymn Data Linking 已加载');

})(window);


















