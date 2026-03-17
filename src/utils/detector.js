 
'use strict';

import fs from 'fs';
import path from 'path';

function detectProjectType(cwd = process.cwd()) {
    const checks = {
        isNode: fs.existsSync(path.join(cwd, 'package.json')),
        isDotNet: fs.readdirSync(cwd).some(f => f.endsWith('.csproj') || f.endsWith('.sln')),
        isAngular: fs.existsSync(path.join(cwd, 'angular.json')),
        isPython: fs.existsSync(path.join(cwd, 'requirements.txt')) || fs.existsSync(path.join(cwd, 'Pipfile')),
        isJava: fs.existsSync(path.join(cwd, 'pom.xml')) || fs.existsSync(path.join(cwd, 'build.gradle')),
        isFlutter: fs.existsSync(path.join(cwd, 'pubspec.yaml')),
        isRuby: fs.existsSync(path.join(cwd, 'Gemfile')),
        isPhp: fs.existsSync(path.join(cwd, 'composer.json')),
        isRust: fs.existsSync(path.join(cwd, 'Cargo.toml')),
        isGo: fs.existsSync(path.join(cwd, 'go.mod')),
    };

    // Dangerous files per stack
    const dangerousPatterns = [
        // Always dangerous
        '.env',
        '.env.local',
        '.env.production',
        '.env.development',
        '.env.staging',
        '*.pem',
        '*.key',
        '*.p12',
        '*.pfx',
        'secrets',
        'secrets.json',
        'secrets.yml',
    ];

    // Ignored folders per stack
    const ignoredPatterns = [];

    if (checks.isNode) {
        dangerousPatterns.push('node_modules');
        ignoredPatterns.push('node_modules/', 'npm-debug.log*', '.npm');
    }

    if (checks.isDotNet) {
        dangerousPatterns.push('bin/', 'obj/', 'packages/');
        ignoredPatterns.push('bin/', 'obj/', 'packages/', '*.user', '*.suo', '.vs/');
    }

    if (checks.isAngular) {
        dangerousPatterns.push('dist/', '.angular/');
        ignoredPatterns.push('dist/', '.angular/');
    }

    if (checks.isPython) {
        dangerousPatterns.push('__pycache__/', 'venv/', '.venv/', 'env/');
        ignoredPatterns.push('__pycache__/', '*.pyc', 'venv/', '.venv/', 'env/', '*.egg-info/');
    }

    if (checks.isJava) {
        dangerousPatterns.push('target/', '.gradle/', 'build/');
        ignoredPatterns.push('target/', '.gradle/', 'build/', '*.class');
    }

    if (checks.isFlutter) {
        dangerousPatterns.push('.dart_tool/', 'build/');
        ignoredPatterns.push('.dart_tool/', 'build/', '*.g.dart');
    }

    if (checks.isRuby) {
        dangerousPatterns.push('vendor/bundle/');
        ignoredPatterns.push('vendor/bundle/', '.bundle/');
    }

    if (checks.isPhp) {
        dangerousPatterns.push('vendor/');
        ignoredPatterns.push('vendor/');
    }

    if (checks.isRust) {
        dangerousPatterns.push('target/');
        ignoredPatterns.push('target/');
    }

    if (checks.isGo) {
        dangerousPatterns.push('vendor/');
        ignoredPatterns.push('vendor/', '*.exe');
    }

    // Detected stack names for display
    const detectedStacks = [];
    if (checks.isNode) detectedStacks.push('Node.js');
    if (checks.isDotNet) detectedStacks.push('.NET');
    if (checks.isAngular) detectedStacks.push('Angular');
    if (checks.isPython) detectedStacks.push('Python');
    if (checks.isJava) detectedStacks.push('Java');
    if (checks.isFlutter) detectedStacks.push('Flutter');
    if (checks.isRuby) detectedStacks.push('Ruby');
    if (checks.isPhp) detectedStacks.push('PHP');
    if (checks.isRust) detectedStacks.push('Rust');
    if (checks.isGo) detectedStacks.push('Go');

    return {
        ...checks,
        detectedStacks,
        dangerousPatterns,
        ignoredPatterns
    };
}

export default detectProjectType;