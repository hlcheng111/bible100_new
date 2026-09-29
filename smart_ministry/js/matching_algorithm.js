/**
 * Bible100 智慧事奉 - 配对算法模块
 * 遵循统一标准的JavaScript命名和结构
 */

// 统一的存储前缀
const STORAGE_PREFIX = 'bible100_smart_ministry_';

/**
 * 事奉岗位配对算法类
 */
class MinistryMatchingAlgorithm {
    constructor() {
        this.ministryPositions = this.initMinistryPositions();
        this.weightConfig = this.initWeightConfig();
    }

    /**
     * 初始化事奉岗位数据
     */
    initMinistryPositions() {
        return [
            {
                id: 'sunday_school_teacher',
                name: '主日学教师',
                category: 'education',
                description: '教导儿童或成人圣经课程',
                requirements: {
                    spiritual_gifts: ['teaching', 'pastoral'],
                    skills: ['communication', 'patience'],
                    time_commitment: ['3-5', '6-10', '10+'],
                    available_times: ['sunday_morning'],
                    faith_years: ['3-10', '10+'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    spiritual_gifts: 0.4,
                    skills: 0.2,
                    time_commitment: 0.15,
                    available_times: 0.15,
                    faith_years: 0.1
                }
            },
            {
                id: 'worship_team',
                name: '敬拜团队',
                category: 'worship',
                description: '带领会众敬拜赞美',
                requirements: {
                    spiritual_gifts: ['service', 'leadership'],
                    skills: ['music'],
                    time_commitment: ['3-5', '6-10', '10+'],
                    available_times: ['sunday_morning', 'weekday_evening'],
                    faith_years: ['1-3', '3-10', '10+'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    skills: 0.5,
                    spiritual_gifts: 0.2,
                    time_commitment: 0.15,
                    available_times: 0.15
                }
            },
            {
                id: 'small_group_leader',
                name: '小组长',
                category: 'leadership',
                description: '带领小组查经和团契',
                requirements: {
                    spiritual_gifts: ['leadership', 'pastoral', 'teaching'],
                    skills: ['communication'],
                    time_commitment: ['6-10', '10+'],
                    available_times: ['weekday_evening', 'saturday'],
                    faith_years: ['3-10', '10+'],
                    communication_level: [4, 5]
                },
                weights: {
                    spiritual_gifts: 0.4,
                    faith_years: 0.2,
                    communication_level: 0.2,
                    time_commitment: 0.1,
                    available_times: 0.1
                }
            },
            {
                id: 'childrens_ministry',
                name: '儿童事工',
                category: 'children',
                description: '照顾和教导儿童',
                requirements: {
                    spiritual_gifts: ['service', 'pastoral', 'teaching'],
                    skills: ['patience', 'creativity'],
                    ministry_burden: ['children'],
                    time_commitment: ['3-5', '6-10', '10+'],
                    available_times: ['sunday_morning', 'saturday'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    ministry_burden: 0.3,
                    spiritual_gifts: 0.25,
                    skills: 0.2,
                    time_commitment: 0.15,
                    available_times: 0.1
                }
            },
            {
                id: 'youth_ministry',
                name: '青少年事工',
                category: 'youth',
                description: '服务青少年群体',
                requirements: {
                    spiritual_gifts: ['leadership', 'pastoral', 'evangelism'],
                    skills: ['communication', 'technology'],
                    ministry_burden: ['youth'],
                    time_commitment: ['6-10', '10+'],
                    available_times: ['weekday_evening', 'saturday'],
                    age: ['18-25', '26-35', '36-50'],
                    communication_level: [4, 5]
                },
                weights: {
                    ministry_burden: 0.3,
                    spiritual_gifts: 0.25,
                    age: 0.2,
                    communication_level: 0.15,
                    time_commitment: 0.1
                }
            },
            {
                id: 'welcome_team',
                name: '接待团队',
                category: 'service',
                description: '接待新朋友和访客',
                requirements: {
                    spiritual_gifts: ['service', 'mercy'],
                    skills: ['communication'],
                    time_commitment: ['1-2', '3-5'],
                    available_times: ['sunday_morning'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    spiritual_gifts: 0.3,
                    communication_level: 0.3,
                    available_times: 0.2,
                    time_commitment: 0.2
                }
            },
            {
                id: 'technical_team',
                name: '技术团队',
                category: 'technical',
                description: '负责音响、投影、网络等技术支持',
                requirements: {
                    spiritual_gifts: ['service', 'administration'],
                    skills: ['technology'],
                    time_commitment: ['3-5', '6-10'],
                    available_times: ['sunday_morning', 'weekday_evening']
                },
                weights: {
                    skills: 0.5,
                    spiritual_gifts: 0.2,
                    time_commitment: 0.15,
                    available_times: 0.15
                }
            },
            {
                id: 'caring_ministry',
                name: '关怀事工',
                category: 'pastoral',
                description: '探访和关怀有需要的弟兄姊妹',
                requirements: {
                    spiritual_gifts: ['mercy', 'pastoral'],
                    skills: ['counseling', 'communication'],
                    time_commitment: ['3-5', '6-10', '10+'],
                    available_times: ['flexible', 'weekday_evening'],
                    faith_years: ['3-10', '10+'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    spiritual_gifts: 0.4,
                    skills: 0.2,
                    faith_years: 0.2,
                    communication_level: 0.2
                }
            },
            {
                id: 'elderly_ministry',
                name: '长者事工',
                category: 'elderly',
                description: '服务和关怀长者',
                requirements: {
                    spiritual_gifts: ['mercy', 'pastoral', 'service'],
                    ministry_burden: ['elderly'],
                    time_commitment: ['3-5', '6-10'],
                    available_times: ['flexible', 'weekday_evening'],
                    communication_level: [3, 4, 5]
                },
                weights: {
                    ministry_burden: 0.35,
                    spiritual_gifts: 0.3,
                    communication_level: 0.2,
                    time_commitment: 0.15
                }
            },
            {
                id: 'administrative_support',
                name: '行政支持',
                category: 'administration',
                description: '协助教会行政和管理工作',
                requirements: {
                    spiritual_gifts: ['administration', 'service'],
                    skills: ['finance', 'writing', 'organization'],
                    time_commitment: ['3-5', '6-10', '10+'],
                    available_times: ['flexible', 'weekday_evening']
                },
                weights: {
                    spiritual_gifts: 0.3,
                    skills: 0.4,
                    time_commitment: 0.15,
                    available_times: 0.15
                }
            }
        ];
    }

    /**
     * 初始化权重配置
     */
    initWeightConfig() {
        return {
            // 默认权重配置
            default: {
                spiritual_gifts: 0.3,
                skills: 0.25,
                ministry_burden: 0.2,
                time_commitment: 0.1,
                available_times: 0.1,
                faith_years: 0.05
            },
            // 新信徒权重配置
            new_believer: {
                spiritual_gifts: 0.2,
                skills: 0.3,
                time_commitment: 0.2,
                available_times: 0.15,
                communication_level: 0.15
            },
            // 成熟信徒权重配置
            mature_believer: {
                spiritual_gifts: 0.4,
                ministry_burden: 0.25,
                faith_years: 0.15,
                time_commitment: 0.1,
                available_times: 0.1
            }
        };
    }

    /**
     * 主要配对函数
     * @param {Object} userProfile 用户档案
     * @returns {Array} 排序后的配对结果
     */
    findMatches(userProfile) {
        try {
            // 验证输入数据
            if (!this.validateUserProfile(userProfile)) {
                throw new Error('用户档案数据不完整');
            }

            const matches = [];

            // 为每个事奉岗位计算匹配度
            for (const position of this.ministryPositions) {
                const matchScore = this.calculateMatchScore(userProfile, position);
                
                if (matchScore > 0.1) { // 只保留匹配度大于10%的结果
                    matches.push({
                        position: position,
                        score: matchScore,
                        reasons: this.generateMatchReasons(userProfile, position, matchScore)
                    });
                }
            }

            // 按匹配度排序
            matches.sort((a, b) => b.score - a.score);

            // 返回前8个最佳匹配
            return matches.slice(0, 8);
        } catch (error) {
            console.error('配对过程出现错误:', error);
            return [];
        }
    }

    /**
     * 验证用户档案
     * @param {Object} userProfile 用户档案
     * @returns {boolean} 是否有效
     */
    validateUserProfile(userProfile) {
        const requiredFields = ['name', 'age', 'faith_years'];
        return requiredFields.every(field => userProfile[field]);
    }

    /**
     * 计算匹配分数
     * @param {Object} userProfile 用户档案
     * @param {Object} position 事奉岗位
     * @returns {number} 匹配分数 (0-1)
     */
    calculateMatchScore(userProfile, position) {
        let totalScore = 0;
        let totalWeight = 0;

        // 获取权重配置
        const weights = this.getWeightConfig(userProfile, position);

        // 计算各个维度的匹配度
        for (const [criterion, weight] of Object.entries(weights)) {
            const score = this.calculateCriterionScore(userProfile, position, criterion);
            totalScore += score * weight;
            totalWeight += weight;
        }

        // 标准化分数
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    /**
     * 获取权重配置
     * @param {Object} userProfile 用户档案
     * @param {Object} position 事奉岗位
     * @returns {Object} 权重配置
     */
    getWeightConfig(userProfile, position) {
        // 如果岗位有自定义权重，使用岗位权重
        if (position.weights) {
            return position.weights;
        }

        // 根据信主年数选择权重配置
        const faithYears = userProfile.faith_years;
        if (faithYears === '0-1' || faithYears === '1-3') {
            return this.weightConfig.new_believer;
        } else if (faithYears === '10+') {
            return this.weightConfig.mature_believer;
        }

        return this.weightConfig.default;
    }

    /**
     * 计算单个标准的匹配分数
     * @param {Object} userProfile 用户档案
     * @param {Object} position 事奉岗位
     * @param {string} criterion 标准名称
     * @returns {number} 分数 (0-1)
     */
    calculateCriterionScore(userProfile, position, criterion) {
        const userValue = userProfile[criterion];
        const positionRequirements = position.requirements[criterion];

        if (!userValue || !positionRequirements) {
            return 0;
        }

        switch (criterion) {
            case 'spiritual_gifts':
                return this.calculateArrayMatchScore(userValue, positionRequirements);
            
            case 'skills':
                return this.calculateArrayMatchScore(userValue, positionRequirements);
            
            case 'available_times':
                return this.calculateArrayMatchScore(userValue, positionRequirements);
            
            case 'ministry_burden':
                return positionRequirements.includes(userValue) ? 1 : 0;
            
            case 'age':
                return positionRequirements.includes(userValue) ? 1 : 0;
            
            case 'faith_years':
                return positionRequirements.includes(userValue) ? 1 : 0;
            
            case 'time_commitment':
                return positionRequirements.includes(userValue) ? 1 : 0;
            
            case 'communication_level':
                return this.calculateNumericMatchScore(parseInt(userValue), positionRequirements);
            
            default:
                return 0;
        }
    }

    /**
     * 计算数组匹配分数
     * @param {Array|string} userValues 用户值
     * @param {Array} requirements 要求
     * @returns {number} 分数 (0-1)
     */
    calculateArrayMatchScore(userValues, requirements) {
        const userArray = Array.isArray(userValues) ? userValues : [userValues];
        const matchCount = userArray.filter(value => requirements.includes(value)).length;
        return matchCount > 0 ? Math.min(matchCount / requirements.length, 1) : 0;
    }

    /**
     * 计算数值匹配分数
     * @param {number} userValue 用户值
     * @param {Array} requirements 要求范围
     * @returns {number} 分数 (0-1)
     */
    calculateNumericMatchScore(userValue, requirements) {
        if (requirements.includes(userValue)) {
            return 1;
        }
        
        // 计算与最近要求值的距离
        const distances = requirements.map(req => Math.abs(userValue - req));
        const minDistance = Math.min(...distances);
        
        // 距离越小，分数越高
        return Math.max(0, 1 - minDistance / 5);
    }

    /**
     * 生成匹配原因
     * @param {Object} userProfile 用户档案
     * @param {Object} position 事奉岗位
     * @param {number} score 匹配分数
     * @returns {Array} 匹配原因列表
     */
    generateMatchReasons(userProfile, position, score) {
        const reasons = [];

        // 检查属灵恩赐匹配
        if (userProfile.spiritual_gifts && position.requirements.spiritual_gifts) {
            const userGifts = Array.isArray(userProfile.spiritual_gifts) ? 
                userProfile.spiritual_gifts : [userProfile.spiritual_gifts];
            const matchedGifts = userGifts.filter(gift => 
                position.requirements.spiritual_gifts.includes(gift));
            
            if (matchedGifts.length > 0) {
                reasons.push(`您的属灵恩赐 (${this.translateGifts(matchedGifts).join('、')}) 与此岗位匹配`);
            }
        }

        // 检查技能匹配
        if (userProfile.skills && position.requirements.skills) {
            const userSkills = Array.isArray(userProfile.skills) ? 
                userProfile.skills : [userProfile.skills];
            const matchedSkills = userSkills.filter(skill => 
                position.requirements.skills.includes(skill));
            
            if (matchedSkills.length > 0) {
                reasons.push(`您的专业技能 (${this.translateSkills(matchedSkills).join('、')}) 很适合`);
            }
        }

        // 检查事工负担匹配
        if (userProfile.ministry_burden && position.requirements.ministry_burden) {
            if (position.requirements.ministry_burden.includes(userProfile.ministry_burden)) {
                reasons.push(`您对${this.translateMinistryBurden(userProfile.ministry_burden)}有负担`);
            }
        }

        // 检查时间匹配
        if (userProfile.available_times && position.requirements.available_times) {
            const userTimes = Array.isArray(userProfile.available_times) ? 
                userProfile.available_times : [userProfile.available_times];
            const matchedTimes = userTimes.filter(time => 
                position.requirements.available_times.includes(time));
            
            if (matchedTimes.length > 0) {
                reasons.push(`您的可用时间与岗位需求匹配`);
            }
        }

        // 如果没有具体原因，给出通用建议
        if (reasons.length === 0) {
            if (score > 0.7) {
                reasons.push('综合评估显示您很适合此岗位');
            } else if (score > 0.4) {
                reasons.push('您具备此岗位的基本条件');
            } else {
                reasons.push('可以考虑从协助开始');
            }
        }

        return reasons;
    }

    /**
     * 翻译属灵恩赐
     */
    translateGifts(gifts) {
        const translations = {
            'teaching': '教导',
            'leadership': '领导',
            'pastoral': '牧养',
            'evangelism': '传福音',
            'service': '服务',
            'giving': '奉献',
            'mercy': '怜悯',
            'administration': '管理'
        };
        return gifts.map(gift => translations[gift] || gift);
    }

    /**
     * 翻译技能
     */
    translateSkills(skills) {
        const translations = {
            'music': '音乐',
            'technology': '技术',
            'design': '设计',
            'writing': '写作',
            'finance': '财务',
            'cooking': '烹饪',
            'crafts': '手工',
            'counseling': '辅导',
            'communication': '沟通',
            'patience': '耐心',
            'creativity': '创意',
            'organization': '组织'
        };
        return skills.map(skill => translations[skill] || skill);
    }

    /**
     * 翻译事工负担
     */
    translateMinistryBurden(burden) {
        const translations = {
            'worship': '敬拜赞美',
            'children': '儿童事工',
            'youth': '青少年事工',
            'adult': '成人事工',
            'elderly': '长者事工',
            'outreach': '宣教外展',
            'social': '社会关怀'
        };
        return translations[burden] || burden;
    }

    /**
     * 保存配对结果
     * @param {string} userId 用户ID
     * @param {Array} matches 配对结果
     */
    saveMatchResults(userId, matches) {
        try {
            const timestamp = new Date().toISOString();
            const resultData = {
                userId: userId,
                timestamp: timestamp,
                matches: matches,
                version: '1.0'
            };

            localStorage.setItem(
                `${STORAGE_PREFIX}match_results_${userId}_${Date.now()}`, 
                JSON.stringify(resultData)
            );

            // 保存最新结果的引用
            localStorage.setItem(
                `${STORAGE_PREFIX}latest_match_${userId}`, 
                JSON.stringify(resultData)
            );

            return true;
        } catch (error) {
            console.error('保存配对结果失败:', error);
            return false;
        }
    }

    /**
     * 获取历史配对结果
     * @param {string} userId 用户ID
     * @returns {Array} 历史结果列表
     */
    getMatchHistory(userId) {
        try {
            const history = [];
            const keys = Object.keys(localStorage);
            
            keys.forEach(key => {
                if (key.startsWith(`${STORAGE_PREFIX}match_results_${userId}_`)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        history.push(data);
                    } catch (e) {
                        console.warn('无法解析历史数据:', key);
                    }
                }
            });

            // 按时间排序
            history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return history;
        } catch (error) {
            console.error('获取配对历史失败:', error);
            return [];
        }
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计数据
     */
    getStatistics() {
        try {
            const stats = {
                totalPositions: this.ministryPositions.length,
                positionsByCategory: {},
                totalMatches: 0,
                averageMatchScore: 0
            };

            // 统计各类别岗位数量
            this.ministryPositions.forEach(position => {
                const category = position.category;
                stats.positionsByCategory[category] = 
                    (stats.positionsByCategory[category] || 0) + 1;
            });

            // 统计配对次数
            const keys = Object.keys(localStorage);
            let totalScore = 0;
            let matchCount = 0;

            keys.forEach(key => {
                if (key.includes(`${STORAGE_PREFIX}match_results_`)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.matches && data.matches.length > 0) {
                            matchCount++;
                            totalScore += data.matches[0].score; // 使用最高匹配分数
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            });

            stats.totalMatches = matchCount;
            stats.averageMatchScore = matchCount > 0 ? totalScore / matchCount : 0;

            return stats;
        } catch (error) {
            console.error('获取统计信息失败:', error);
            return {};
        }
    }
}

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MinistryMatchingAlgorithm;
} else {
    window.MinistryMatchingAlgorithm = MinistryMatchingAlgorithm;
}
