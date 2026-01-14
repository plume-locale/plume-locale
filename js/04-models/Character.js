/**
 * Character Model
 * Represents a character in the story with all their attributes
 */

class Character {
    constructor(data = {}) {
        // Identity
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.nickname = data.nickname || '';
        this.pronouns = data.pronouns || '';
        
        // Basic Info
        this.sex = data.sex || '';
        this.race = data.race || 'Humain';
        this.age = data.age || '';
        this.birthDate = data.birthDate || '';
        this.birthPlace = data.birthPlace || '';
        this.residence = data.residence || '';
        this.occupation = data.occupation || '';
        
        // Visual
        this.role = data.role || '';
        this.roleImportance = data.roleImportance || 3; // 1-5 stars
        this.color = data.color || '#3498db';
        this.avatarEmoji = data.avatarEmoji || '🙂';
        this.avatarImage = data.avatarImage || '';
        
        // Physical Description
        this.height = data.height || '';
        this.weight = data.weight || '';
        this.bodyType = data.bodyType || '';
        this.hairColor = data.hairColor || '';
        this.eyeColor = data.eyeColor || '';
        this.voice = data.voice || '';
        this.clothing = data.clothing || '';
        this.accessories = data.accessories || '';
        this.physicalDescription = data.physicalDescription || '';
        
        // Personality
        this.qualities = data.qualities || [];
        this.flaws = data.flaws || [];
        this.tastes = data.tastes || '';
        this.habits = data.habits || '';
        this.fears = data.fears || '';
        
        // Personality Radar (0-20)
        this.personality = {
            intelligence: data.personality?.intelligence || 10,
            force: data.personality?.force || 10,
            robustesse: data.personality?.robustesse || 10,
            empathie: data.personality?.empathie || 10,
            perception: data.personality?.perception || 10,
            agilite: data.personality?.agilite || 10,
            sociabilite: data.personality?.sociabilite || 10,
            ...data.personality
        };
        
        // Background
        this.education = data.education || '';
        this.wealth = data.wealth || 50; // 0-100 slider
        this.secrets = data.secrets || '';
        this.beliefs = data.beliefs || '';
        
        // Relationships
        this.relations = data.relations || [];
        
        // Story Information
        this.scenes = data.scenes || [];
        this.aliases = data.aliases || [];
        this.tags = data.tags || [];
        this.notes = data.notes || '';
        
        // Metadata
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    /**
     * Validates the character data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Le nom du personnage est requis');
        }
        if (this.roleImportance < 1 || this.roleImportance > 5) {
            throw new Error('L\'importance du rôle doit être entre 1 et 5');
        }
        if (this.wealth < 0 || this.wealth > 100) {
            throw new Error('La richesse doit être entre 0 et 100');
        }
        return true;
    }

    /**
     * Returns a clean JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            firstName: this.firstName,
            lastName: this.lastName,
            nickname: this.nickname,
            pronouns: this.pronouns,
            sex: this.sex,
            race: this.race,
            age: this.age,
            birthDate: this.birthDate,
            birthPlace: this.birthPlace,
            residence: this.residence,
            occupation: this.occupation,
            role: this.role,
            roleImportance: this.roleImportance,
            color: this.color,
            avatarEmoji: this.avatarEmoji,
            avatarImage: this.avatarImage,
            height: this.height,
            weight: this.weight,
            bodyType: this.bodyType,
            hairColor: this.hairColor,
            eyeColor: this.eyeColor,
            voice: this.voice,
            clothing: this.clothing,
            accessories: this.accessories,
            physicalDescription: this.physicalDescription,
            qualities: this.qualities,
            flaws: this.flaws,
            tastes: this.tastes,
            habits: this.habits,
            fears: this.fears,
            personality: this.personality,
            education: this.education,
            wealth: this.wealth,
            secrets: this.secrets,
            beliefs: this.beliefs,
            relations: this.relations,
            scenes: this.scenes,
            aliases: this.aliases,
            tags: this.tags,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Gets a summary for quick display
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            color: this.color,
            avatarEmoji: this.avatarEmoji
        };
    }
}
