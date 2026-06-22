"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const dbDir = (0, path_1.join)(__dirname, '..', '..', 'data');
(0, fs_1.mkdirSync)(dbDir, { recursive: true });
exports.typeOrmConfig = {
    type: 'sqlite',
    database: (0, path_1.join)(dbDir, 'liftdoor.db'),
    entities: [(0, path_1.join)(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: true
};
//# sourceMappingURL=typeorm.config.js.map