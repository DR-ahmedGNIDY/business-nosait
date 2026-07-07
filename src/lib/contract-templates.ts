import { formatCurrency } from "./utils";

interface TplCtx {
  business?: string;
  clientName?: string;
  value?: number;
  advance?: number;
}

/** Default Arabic/English bilingual terms per contract template. */
export const CONTRACT_TEMPLATES: Record<string, { title: string; terms: (c: TplCtxAll) => string }> = {
  website: {
    title: "Website Development Agreement",
    terms: (c) => defaultTerms("website development (design, build, and launch of a corporate website)", c),
  },
  store: {
    title: "E-commerce Store Agreement",
    terms: (c) => defaultTerms("e-commerce store development including product catalog, cart, and checkout", c),
  },
  application: {
    title: "Application Development Agreement",
    terms: (c) => defaultTerms("custom application development (web/mobile) per the agreed specification", c),
  },
  hosting: {
    title: "Hosting Agreement",
    terms: (c) => defaultTerms("annual web hosting, including server resources, uptime monitoring and backups", c),
  },
  maintenance: {
    title: "Maintenance Agreement",
    terms: (c) => defaultTerms("ongoing website maintenance, updates, security patches and technical support", c),
  },
  marketing: {
    title: "Digital Marketing Agreement",
    terms: (c) => defaultTerms("digital marketing services including campaign management and content", c),
  },
};

type TplCtxAll = TplCtx;

function defaultTerms(scope: string, c: TplCtxAll) {
  const value = c.value || 0;
  const advance = c.advance || 0;
  const remaining = Math.max(0, value - advance);
  return `This agreement is made between ${c.business || "Nosait Business"} ("the Company") and ${c.clientName || "the Client"} ("the Client").

1. Scope of Work
The Company shall provide ${scope}.

2. Financials
- Total contract value: ${formatCurrency(value)}
- Advance payment: ${formatCurrency(advance)}
- Remaining balance: ${formatCurrency(remaining)}
The remaining balance is due upon delivery unless otherwise agreed in writing.

3. Timeline
Work commences upon receipt of the advance payment. Delivery dates are as agreed between the parties.

4. Revisions
Two rounds of revisions are included. Additional revisions may be billed separately.

5. Intellectual Property
Upon full payment, deliverables and their ownership transfer to the Client.

6. Confidentiality
Both parties agree to keep shared information confidential.

7. Termination
Either party may terminate with written notice. Work completed to date remains payable.

8. Acceptance
By signing below, both parties agree to the terms of this contract.

بموجب توقيع الطرفين أدناه، يقر الطرفان بالموافقة على كافة بنود هذا العقد.`;
}
