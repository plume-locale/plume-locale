# Product Tour for Plume - Planning Documentation

## 📋 Overview

This directory contains comprehensive planning documentation for implementing an interactive product tour in Plume, a writing application. The tour will guide new users through the app's extensive features, improving onboarding and user retention.

## 📁 Documentation Files

### 1. [product-tour-architecture.md](./product-tour-architecture.md)
**Complete architectural design and technical specifications**

- Executive summary and objectives
- Technology selection (Driver.js recommended)
- Architecture design with Mermaid diagrams
- Tour flow and stages (29 steps total)
- Technical implementation details
- State management approach
- UX design specifications
- Responsive design strategy
- Accessibility features
- Performance considerations
- Testing strategy
- Implementation phases
- Success metrics
- Risk assessment

**Key Decision**: Use Driver.js (5KB, no dependencies, MIT license)

### 2. [tour-steps-specification.md](./tour-steps-specification.md)
**Detailed specification of all tour steps**

- Tour configuration settings
- Complete step-by-step definitions (29 steps)
- Element selectors and positioning
- Content for each step (titles, descriptions)
- Step interactions and callbacks
- Mobile tour steps (simplified 10-step version)
- Conditional steps
- Accessibility enhancements
- Localization support structure
- Analytics events (optional)

**Tour Stages**:
1. Welcome & Orientation (4 steps)
2. Core Writing Features (10 steps)
3. Database Features (4 steps)
4. Visualization Tools (4 steps)
5. Advanced Features (6 steps)
6. Completion (1 step)

### 3. [implementation-guide.md](./implementation-guide.md)
**Step-by-step implementation instructions**

- Prerequisites
- 8-step implementation process
- Code examples for each file
- Complete CSS styling
- JavaScript implementation
- HTML modifications
- Testing checklist (40+ test cases)
- Troubleshooting guide
- Customization instructions
- Maintenance procedures

**Files to Create/Modify**:
- `html/head.html` - Add Driver.js CDN
- `css/14.product-tour.css` - Tour styling
- `js/47.product-tour.js` - Main tour logic
- `js/48.tour-steps.js` - Step definitions
- `html/body.html` - Add tour button
- `js/04.init.js` - Initialize tour

## 🎯 Quick Start

To implement the product tour:

1. **Read** [`product-tour-architecture.md`](./product-tour-architecture.md) for understanding
2. **Follow** [`implementation-guide.md`](./implementation-guide.md) step-by-step
3. **Reference** [`tour-steps-specification.md`](./tour-steps-specification.md) for content

## 🔑 Key Features

### User Experience
- ✅ Welcome modal for first-time users
- ✅ 29-step comprehensive tour (desktop)
- ✅ 10-step simplified tour (mobile)
- ✅ Progress indicator
- ✅ Skip/Resume functionality
- ✅ Persistent state (IndexedDB)
- ✅ Manual restart option

### Technical Features
- ✅ Lightweight (10KB total addition)
- ✅ No external dependencies (except Driver.js)
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Dark theme compatible
- ✅ Print-friendly

### Accessibility
- ✅ WCAG 2.1 compliant
- ✅ Keyboard shortcuts (Esc, Enter, Tab)
- ✅ ARIA labels
- ✅ Focus management
- ✅ High contrast mode support
- ✅ Reduced motion support

## 📊 Tour Structure

```
Welcome Modal
    ↓
[Start Tour] → Step 1: Welcome
                  ↓
              Step 2-4: Orientation
                  ↓
              Step 5-14: Core Features
                  ↓
              Step 15-18: Database
                  ↓
              Step 19-23: Visualizations
                  ↓
              Step 24-28: Advanced
                  ↓
              Step 29: Completion
                  ↓
              [Tour Complete]
```

## 🛠️ Technology Stack

| Component | Technology | Size | License |
|-----------|-----------|------|---------|
| Tour Library | Driver.js v1.3.1 | 5KB | MIT |
| State Storage | IndexedDB (existing) | - | - |
| Styling | Custom CSS | 2KB | - |
| Configuration | JavaScript | 3KB | - |
| **Total** | | **~10KB** | |

## 📱 Responsive Breakpoints

- **Desktop** (> 1024px): Full 29-step tour
- **Tablet** (768px - 1024px): Condensed tour
- **Mobile** (< 768px): Simplified 10-step tour

## 🎨 Design Principles

1. **Non-intrusive**: Users can skip or dismiss at any time
2. **Progressive**: Information revealed gradually
3. **Contextual**: Steps shown in relevant locations
4. **Accessible**: Works with keyboard and screen readers
5. **Performant**: Minimal impact on app load time
6. **Maintainable**: Modular and well-documented code

## 📈 Success Metrics

### Quantitative
- Tour completion rate: Target > 60%
- Average completion time: 3-5 minutes
- Feature discovery rate: +40%
- User retention (Day 7): +25%

### Qualitative
- User feedback on helpfulness
- Reduction in support questions
- Improved user confidence
- Positive onboarding experience

## 🧪 Testing Requirements

### Functional (12 tests)
- Tour initialization
- Navigation controls
- State persistence
- Skip functionality
- Restart capability

### Visual (7 tests)
- Popover positioning
- Element highlighting
- Overlay appearance
- Animation smoothness

### Responsive (4 tests)
- Desktop layouts
- Tablet layouts
- Mobile layouts
- Orientation changes

### Browser (4 tests)
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

### Accessibility (5 tests)
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus indicators
- Reduced motion

**Total: 32 test cases**

## 🚀 Implementation Phases

### Phase 1: Foundation
- Add Driver.js library
- Create basic infrastructure
- Implement state management
- Add welcome modal
- Create first 5 steps

### Phase 2: Content Development
- Define all tour steps
- Write descriptions
- Add custom styling
- Implement step actions
- Add progress tracking

### Phase 3: Polish & Integration
- Add keyboard navigation
- Implement responsive behavior
- Add accessibility features
- Create restart functionality
- Add header button

### Phase 4: Testing & Refinement
- Cross-browser testing
- Responsive testing
- Accessibility audit
- User feedback collection
- Performance optimization

## ⚠️ Important Considerations

### Browser Compatibility
- Requires modern browsers with ES6+ support
- IndexedDB support required
- CSS Grid and Flexbox support needed

### Performance
- Lazy load Driver.js (only when needed)
- Defer tour initialization
- Minimize DOM queries
- Use event delegation

### Maintenance
- Keep tour content in sync with app changes
- Update tour version when making significant changes
- Monitor completion rates
- Collect user feedback

## 🔄 Future Enhancements

### Short-term
- [ ] Feature-specific mini-tours
- [ ] "What's This?" tooltips
- [ ] Interactive help system

### Long-term
- [ ] Role-based tours (novelist, screenwriter)
- [ ] Adaptive tour based on behavior
- [ ] Achievement badges
- [ ] Feature mastery tracking

## 📞 Support & Maintenance

### Adding New Steps
1. Edit [`js/48.tour-steps.js`](../js/48.tour-steps.js)
2. Add step definition to `getTourSteps()`
3. Test the new step
4. Update documentation

### Modifying Existing Steps
1. Locate step in [`js/48.tour-steps.js`](../js/48.tour-steps.js)
2. Update content or behavior
3. Test changes
4. Consider incrementing tour version

### Troubleshooting
See [implementation-guide.md](./implementation-guide.md#troubleshooting) for common issues and solutions.

## 📚 Additional Resources

### Driver.js Documentation
- Official Docs: https://driverjs.com/
- GitHub: https://github.com/kamranahmedse/driver.js
- Examples: https://driverjs.com/docs/examples

### UX Best Practices
- Keep steps concise (< 50 words)
- Use clear, action-oriented language
- Show, don't just tell
- Allow users to explore
- Provide escape routes

### Accessibility Guidelines
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

## 📝 Change Log

### Version 1.0 (2026-02-01)
- Initial planning documentation
- Architecture design completed
- Tour steps defined (29 steps)
- Implementation guide created
- Testing strategy established

## 👥 Contributors

- **Architect Mode**: Planning and design
- **Code Mode**: Implementation (pending)
- **Debug Mode**: Testing and refinement (pending)

## 📄 License

This documentation is part of the Plume project. Refer to the main project license.

---

## Next Steps

1. **Review** this documentation with the team
2. **Approve** the architectural decisions
3. **Switch to Code Mode** to begin implementation
4. **Follow** the implementation guide step-by-step
5. **Test** thoroughly using the provided checklist
6. **Iterate** based on user feedback

---

**Status**: ✅ Planning Complete - Ready for Implementation  
**Last Updated**: 2026-02-01  
**Version**: 1.0
