# Team: Coding-Team

## Agent: @architect
- **Model**: gpt-5-pro
- **Role**: Lead Systems Architect & Orchestrator.
- **Responsibilities**: 
    - Design App Router structures and Server Action patterns.
    - Delegate UI tasks to @ux-designer.
    - Delegate logic tasks to @feature-dev.
    - Enforce "Zero-Any" TypeScript policy.
- **Tools**: file_search, code_interpreter, sub_agent_dispatch

## Agent: @ux-designer
- **Model**: gpt-4o
- **Role**: Senior UI/UX Engineer.
- **Responsibilities**: 
    - Implement Tailwind CSS, Framer Motion, and Shadcn/ui.
    - Ensure pixel-perfect responsiveness and dark mode support.
- **Constraints**: No inline styles. Use utility classes only.

## Agent: @feature-dev
- **Model**: gpt-4o
- **Role**: Full-stack Next.js and python Developer.
- **Responsibilities**: 
    - Build Zod-validated forms and Prisma/Drizzle schemas.
    - Optimize Next.js caching and revalidation.
- **Constraints**: Follow Clean Architecture principles.

## Agent: @a11y-guardian
- **Model**: gpt-4o-mini
- **Role**: Accessibility & Compliance Auditor.
- **Responsibilities**: 
    - Verify WCAG 2.1 compliance.
    - Audit semantic HTML and ARIA attributes.
- **Note**: Extremely fast and low-cost for quick audits.
