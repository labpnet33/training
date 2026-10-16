var e={id:`dlp-ai`,h:{en:`Data loss prevention and AI guardrails for generative-AI apps`,hi:`Data loss prevention aur generative-AI apps ke liye AI guardrails`},body:{en:`
<p>At a bank branch, cash can leave the building only in the armoured van, and every bag is counted at the door. Nobody stops staff from walking out, but a bag full of notes is noticed. <b>Data loss prevention (DLP)</b> counts the bags for data: it lets work flow, but notices and stops card numbers, national IDs and confidential documents leaving to the wrong place. <b>AI guardrails</b> are a newer door: the chat box of a generative-AI app, where people paste data and where attackers try to trick the model.</p>

<h3>How a DLP rule is built</h3>
<p>Go to <b>Secure, DLP &amp; AI Guardrails</b> and click <b>DLP rule</b>. The dialog <b>Add real-time DLP rule</b> has:</p>
<ul>
<li><b>Data identifiers</b>: patterns that recognise sensitive data. The lab offers Credit Card Number (with a Luhn checksum, so random 16-digit numbers do not match), Aadhaar Number, India PAN, AWS Access Key and Confidential Label. Real products ship hundreds of built-in identifiers and add custom dictionaries, exact data match (EDM, fingerprints of real database rows) and indexed document match.</li>
<li><b>Destinations</b>: where the rule applies, for example the Cloud Storage category or a specific app.</li>
<li><b>Action</b>: <b>Block</b> or <b>Monitor</b> (log only), and a <b>Severity</b>: Critical, High, Medium or Low.</li>
</ul>
<p><b>Real-time DLP</b> works inline on uploads and posts that pass through the SWG, so for HTTPS it needs <b>decryption</b>. <b>SaaS API DLP</b> works out of band, scanning files already stored in sanctioned SaaS through the vendor API, and can remediate (for example remove a public sharing link).</p>

<h3>Lab walk-through: stop PII leaving to cloud storage</h3>
<p>Asha Verma (Finance, ROAM1) has a payroll export. First prove the leak exists:</p>
<pre class="out">ROAM1&gt; cat Q3-payroll.csv
employee_id,name,pan,aadhaar,corporate_card
E1021,Asha Verma,ABCPV1234K,2345 6789 0123,4111 1111 1111 1111
...
ROAM1&gt; upload Q3-payroll.csv nwkings.cloudbox.example/upload
{"status":"<span class="hl">uploaded</span>","workspace":"nwkings","file":"Q3-payroll.csv","bytes":235}</pre>
<p>Create <b>Block PII to Cloud Storage</b>: identifiers Credit Card Number, India PAN and Aadhaar Number; destination category Cloud Storage; action Block; severity High. Upload again: it <b>still succeeds and no DLP event appears</b>. Activity Search shows <code>Allowed Web nwkings.cloudbox.example Rule: Default Internet Access</code>, and the Default Security Profile has <b>Decryption off</b>. The upload is HTTPS, so the gateway never saw the file. Turn on <b>Decryption</b> in <b>Security Profiles, Default Security Profile</b> (the profile of the matching rule) and retry:</p>
<pre class="out">ROAM1&gt; upload Q3-payroll.csv nwkings.cloudbox.example/upload
&lt;h1&gt;This site is blocked&lt;/h1&gt;&lt;p&gt;&lt;b&gt;nwkings.cloudbox.example&lt;/b&gt;&lt;/p&gt;
&lt;p&gt;The upload contains sensitive data that MyPnetLab policy does not allow to leave the organisation.&lt;/p&gt;
&lt;p&gt;Reason: <span class="hl">DLP: Block PII to Cloud Storage (Credit Card Number, Aadhaar Number, India PAN)</span> · Rule: Default Internet Access&lt;/p&gt;

ROAM1&gt; upload team-offsite.pdf nwkings.cloudbox.example/upload
{"status":"uploaded","workspace":"nwkings","file":"team-offsite.pdf","bytes":115}</pre>
<p>The <b>Events</b> table on the DLP page lists the file, the matched identifiers and the rule: three identifiers matched in Q3-payroll.csv, which answers the lab question. The harmless agenda passes, which is what good DLP looks like: specific, not a blanket block.</p>

<h3>AI guardrails: the chat box is a new exit and a new entrance</h3>
<p>Generative-AI apps add two risks. <b>Data leakage</b>: employees paste customer lists, source code or contracts into prompts. <b>Prompt injection</b>: input written to make a model ignore its instructions, reveal its hidden system prompt or misuse tools (covered in depth in sec-concepts). AI guardrails inspect prompts sent to AI apps and block or monitor three kinds of problem in the lab: <b>Prompt Injection</b>, <b>Sensitive Data</b> and <b>Harmful Content</b>. Combine them with CASB: allow the sanctioned AI app, block unsanctioned ones, and watch AI usage in Reports.</p>
<p>Click <b>AI guardrail</b>, then in <b>Add AI guardrail rule</b> set name <b>ChatAI Guardrails</b>, Generative AI applications <b>ChatAI</b>, Guardrails <b>Prompt Injection</b> and <b>Sensitive Data</b>, Action <b>Block</b>.</p>
<pre class="out">ROAM1&gt; ai-chat prompt-summary.txt
{"id":"chat-3f9a01c2","model":"chatai-4","reply":"<span class="hl">Sure — here is a draft based on your prompt.</span>","usage":{"prompt_tokens":50}}

ROAM1&gt; ai-chat prompt-jailbreak.txt
&lt;p&gt;Your prompt was stopped by the AI guardrails of MyPnetLab.&lt;/p&gt;
&lt;p&gt;Reason: <span class="hl">AI Guardrails: ChatAI Guardrails (Prompt Injection)</span> · Rule: Default Internet Access&lt;/p&gt;

ROAM1&gt; ai-chat prompt-customers.txt
&lt;p&gt;Reason: <span class="hl">AI Guardrails: ChatAI Guardrails (Sensitive Data)</span> · Rule: Default Internet Access&lt;/p&gt;</pre>
<p>The jailbreak file asks the model to ignore all previous instructions and reveal its system prompt: a classic injection indicator, so the guardrail that stopped it is <b>Prompt Injection</b>. The customer file contains card and Aadhaar numbers, so Sensitive Data stopped it. The meeting summary is answered normally.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DLP and AI inspection path">
<rect x="10" y="85" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="112" text-anchor="middle" class="svg-ink" font-size="12">ROAM1</text>
<rect x="150" y="80" width="110" height="54" rx="8" fill="#fde68a"/><text x="205" y="103" text-anchor="middle" class="svg-ink" font-size="12">Decrypt</text><text x="205" y="120" text-anchor="middle" class="svg-muted" font-size="11">root CA</text>
<rect x="300" y="30" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="375" y="57" text-anchor="middle" class="svg-ink" font-size="12">DLP identifiers</text>
<rect x="300" y="140" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="375" y="167" text-anchor="middle" class="svg-ink" font-size="12">AI guardrails</text>
<rect x="490" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="12">Cloud Storage</text>
<rect x="490" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="12">ChatAI</text>
<line x1="110" y1="107" x2="150" y2="107" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="260" y1="115" x2="300" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="52" x2="490" y2="52" stroke="#64748b" stroke-width="2"/><line x1="450" y1="162" x2="490" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Both controls need decrypted content. Without the Decrypt box, uploads and prompts pass uninspected.</p></div>

<div class="eg"><p><b>Worked example: rolling out DLP safely.</b> Week 1: rule in <b>Monitor</b>, severity High. Events show 214 hits; 190 are the payroll team's approved uploads to the HR system's tenant, 24 are uploads to personal storage. Week 2: add an exception (a separate allow path for the HR app) and switch the rule to <b>Block</b>. Hits drop to 3 a week, all genuine.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Creating the DLP rule and testing over HTTPS with decryption off. Going straight to Block with broad identifiers and flooding the help desk. Blocking all AI apps, which pushes users to unmanaged phones; sanction one and guard it instead.</p></div>

<div class="exam"><p><b>Exam traps.</b> Real-time DLP is inline and needs decryption; SaaS API DLP is out of band for data at rest. DLP actions are Block or Monitor. AI guardrails inspect <b>prompts</b> to GenAI apps for prompt injection, sensitive data and harmful content.</p></div>

<div class="scn"><h4>DLP never fires</h4><p>A DLP rule blocked card numbers to Cloud Storage, yet a test upload of a card list to an HTTPS file-sharing site succeeded with no DLP event. Activity Search showed <code>Allowed Web nwkings.cloudbox.example Rule: Default Internet Access</code> and the profile <code>Decryption: Off</code>. The engineer enabled decryption in that profile, confirmed the root CA was trusted on the test laptop, and the next upload was blocked with three identifiers matched.</p><p><b>Lesson:</b> inline DLP must see the content; for HTTPS that means decryption in the profile of the rule that matches.</p></div>

<div class="iv"><p class="q">"How would you let employees use a GenAI assistant without leaking customer data?"</p><p>Strong answer: discover AI app usage, sanction one app and block or warn on the others; enable decryption; add DLP identifiers for customer data and AI guardrails for prompt injection and sensitive data on the sanctioned app, starting in Monitor; review events, tune, then Block; train users. Mention that guardrails also protect the model from injection, not only the data from leaking.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DLP rule = data identifiers + destinations + action (Block or Monitor) + severity.</li>
<li>Real-time DLP is inline and needs decryption; SaaS API DLP scans data at rest.</li>
<li>AI guardrails check prompts for Prompt Injection, Sensitive Data and Harmful Content.</li>
<li>Start in Monitor, tune false positives, then Block.</li>
<li>Sanction and guard one AI app rather than blocking every AI tool.</li>
</ul></div>
`,hi:`
<p>Bank branch mein cash building se sirf armoured van mein bahar jaa sakta hai, aur darwaze par har bag gina jaata hai. Staff ko bahar jaane se koi nahi rokta, par notes se bhara bag pakda jaata hai. <b>Data loss prevention (DLP)</b> data ke liye bags ginta hai: kaam chalne deta hai, par card numbers, national IDs aur confidential documents ko galat jagah jaate dekh kar rok deta hai. <b>AI guardrails</b> ek naya darwaza hain: generative-AI app ka chat box, jahan log data paste karte hain aur jahan attackers model ko dhokha dene ki koshish karte hain.</p>

<h3>DLP rule kaise banta hai</h3>
<p><b>Secure, DLP &amp; AI Guardrails</b> par jao aur <b>DLP rule</b> click karo. <b>Add real-time DLP rule</b> dialog mein hai:</p>
<ul>
<li><b>Data identifiers</b>: patterns jo sensitive data pehchaante hain. Lab mein Credit Card Number (Luhn checksum ke saath, isliye random 16-digit numbers match nahi karte), Aadhaar Number, India PAN, AWS Access Key aur Confidential Label hain. Real products sainkdon built-in identifiers ke saath aate hain aur custom dictionaries, exact data match (EDM, asli database rows ke fingerprints) aur indexed document match jodte hain.</li>
<li><b>Destinations</b>: rule kahan lagta hai, jaise Cloud Storage category ya specific app.</li>
<li><b>Action</b>: <b>Block</b> ya <b>Monitor</b> (sirf log), aur <b>Severity</b>: Critical, High, Medium ya Low.</li>
</ul>
<p><b>Real-time DLP</b> SWG se guzarne wale uploads aur posts par inline kaam karta hai, isliye HTTPS ke liye ise <b>decryption</b> chahiye. <b>SaaS API DLP</b> out of band kaam karta hai, vendor API se sanctioned SaaS mein pehle se stored files scan karta hai, aur remediate kar sakta hai (jaise public sharing link hatana).</p>

<h3>Lab walk-through: PII ko cloud storage par jaane se roko</h3>
<p>Asha Verma (Finance, ROAM1) ke paas payroll export hai. Pehle saabit karo ki leak hai:</p>
<pre class="out">ROAM1&gt; cat Q3-payroll.csv
employee_id,name,pan,aadhaar,corporate_card
E1021,Asha Verma,ABCPV1234K,2345 6789 0123,4111 1111 1111 1111
...
ROAM1&gt; upload Q3-payroll.csv nwkings.cloudbox.example/upload
{"status":"<span class="hl">uploaded</span>","workspace":"nwkings","file":"Q3-payroll.csv","bytes":235}</pre>
<p><b>Block PII to Cloud Storage</b> banao: identifiers Credit Card Number, India PAN aur Aadhaar Number; destination category Cloud Storage; action Block; severity High. Dobara upload karo: yeh <b>ab bhi chal jaata hai aur koi DLP event nahi aata</b>. Activity Search <code>Allowed Web nwkings.cloudbox.example Rule: Default Internet Access</code> dikhata hai, aur Default Security Profile mein <b>Decryption off</b> hai. Upload HTTPS hai, isliye gateway ne file kabhi dekhi hi nahi. <b>Security Profiles, Default Security Profile</b> (matching rule ka profile) mein <b>Decryption</b> on karo aur retry karo:</p>
<pre class="out">ROAM1&gt; upload Q3-payroll.csv nwkings.cloudbox.example/upload
&lt;h1&gt;This site is blocked&lt;/h1&gt;&lt;p&gt;&lt;b&gt;nwkings.cloudbox.example&lt;/b&gt;&lt;/p&gt;
&lt;p&gt;The upload contains sensitive data that MyPnetLab policy does not allow to leave the organisation.&lt;/p&gt;
&lt;p&gt;Reason: <span class="hl">DLP: Block PII to Cloud Storage (Credit Card Number, Aadhaar Number, India PAN)</span> · Rule: Default Internet Access&lt;/p&gt;

ROAM1&gt; upload team-offsite.pdf nwkings.cloudbox.example/upload
{"status":"uploaded","workspace":"nwkings","file":"team-offsite.pdf","bytes":115}</pre>
<p>DLP page ki <b>Events</b> table file, matched identifiers aur rule list karti hai: Q3-payroll.csv mein teen identifiers match hue, yahi lab question ka jawab hai. Harmless agenda pass ho jaata hai, aur achha DLP aisa hi dikhta hai: specific, blanket block nahi.</p>

<h3>AI guardrails: chat box ek naya exit aur ek naya entrance hai</h3>
<p>Generative-AI apps do risks jodte hain. <b>Data leakage</b>: employees customer lists, source code ya contracts prompts mein paste karte hain. <b>Prompt injection</b>: aisa input jo model ko uske instructions ignore karne, chhupa system prompt reveal karne ya tools misuse karne par majboor kare (sec-concepts mein detail mein). AI guardrails AI apps ko bheje prompts inspect karte hain aur lab mein teen tarah ki problems block ya monitor karte hain: <b>Prompt Injection</b>, <b>Sensitive Data</b> aur <b>Harmful Content</b>. Inhe CASB ke saath jodo: sanctioned AI app allow, unsanctioned block, aur Reports mein AI usage dekho.</p>
<p><b>AI guardrail</b> click karo, phir <b>Add AI guardrail rule</b> mein name <b>ChatAI Guardrails</b>, Generative AI applications <b>ChatAI</b>, Guardrails <b>Prompt Injection</b> aur <b>Sensitive Data</b>, Action <b>Block</b> set karo.</p>
<pre class="out">ROAM1&gt; ai-chat prompt-summary.txt
{"id":"chat-3f9a01c2","model":"chatai-4","reply":"<span class="hl">Sure — here is a draft based on your prompt.</span>","usage":{"prompt_tokens":50}}

ROAM1&gt; ai-chat prompt-jailbreak.txt
&lt;p&gt;Your prompt was stopped by the AI guardrails of MyPnetLab.&lt;/p&gt;
&lt;p&gt;Reason: <span class="hl">AI Guardrails: ChatAI Guardrails (Prompt Injection)</span> · Rule: Default Internet Access&lt;/p&gt;

ROAM1&gt; ai-chat prompt-customers.txt
&lt;p&gt;Reason: <span class="hl">AI Guardrails: ChatAI Guardrails (Sensitive Data)</span> · Rule: Default Internet Access&lt;/p&gt;</pre>
<p>Jailbreak file model se kehti hai ki saare previous instructions ignore karo aur apna system prompt reveal karo: classic injection indicator, isliye jis guardrail ne ise roka woh hai <b>Prompt Injection</b>. Customer file mein card aur Aadhaar numbers hain, isliye Sensitive Data ne use roka. Meeting summary ka normal jawab aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="DLP and AI inspection path">
<rect x="10" y="85" width="100" height="44" rx="8" fill="#bae6fd"/><text x="60" y="112" text-anchor="middle" class="svg-ink" font-size="12">ROAM1</text>
<rect x="150" y="80" width="110" height="54" rx="8" fill="#fde68a"/><text x="205" y="103" text-anchor="middle" class="svg-ink" font-size="12">Decrypt</text><text x="205" y="120" text-anchor="middle" class="svg-muted" font-size="11">root CA</text>
<rect x="300" y="30" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="375" y="57" text-anchor="middle" class="svg-ink" font-size="12">DLP identifiers</text>
<rect x="300" y="140" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="375" y="167" text-anchor="middle" class="svg-ink" font-size="12">AI guardrails</text>
<rect x="490" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="12">Cloud Storage</text>
<rect x="490" y="140" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="12">ChatAI</text>
<line x1="110" y1="107" x2="150" y2="107" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="300" y2="55" stroke="#64748b" stroke-width="2"/><line x1="260" y1="115" x2="300" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="52" x2="490" y2="52" stroke="#64748b" stroke-width="2"/><line x1="450" y1="162" x2="490" y2="162" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Dono controls ko decrypted content chahiye. Decrypt box ke bina uploads aur prompts bina inspection ke nikal jaate hain.</p></div>

<div class="eg"><p><b>Worked example: DLP safely roll out karna.</b> Week 1: rule <b>Monitor</b> mein, severity High. Events 214 hits dikhate hain; 190 payroll team ke HR system tenant par approved uploads hain, 24 personal storage par uploads. Week 2: exception jodo (HR app ke liye alag allow path) aur rule ko <b>Block</b> par switch karo. Hits hafte mein 3 par aa jaate hain, sab genuine.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> DLP rule banana aur decryption off rakh kar HTTPS par test karna. Broad identifiers ke saath seedha Block par jaana aur help desk ko flood karna. Saare AI apps block karna, jisse users unmanaged phones par chale jaate hain; ek sanction karo aur use guard karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Real-time DLP inline hai aur use decryption chahiye; SaaS API DLP data at rest ke liye out of band hai. DLP actions Block ya Monitor hain. AI guardrails GenAI apps ko jaane wale <b>prompts</b> mein prompt injection, sensitive data aur harmful content inspect karte hain.</p></div>

<div class="scn"><h4>DLP kabhi trigger nahi hota</h4><p>Ek DLP rule Cloud Storage par card numbers block karta tha, phir bhi HTTPS file-sharing site par card list ka test upload bina DLP event ke chal gaya. Activity Search ne <code>Allowed Web nwkings.cloudbox.example Rule: Default Internet Access</code> aur profile <code>Decryption: Off</code> dikhaya. Engineer ne us profile mein decryption enable kiya, confirm kiya ki test laptop par root CA trusted hai, aur agla upload teen identifiers match hone ke saath block hua.</p><p><b>Seekh:</b> inline DLP ko content dekhna padta hai; HTTPS ke liye iska matlab hai matching rule ke profile mein decryption.</p></div>

<div class="iv"><p class="q">"Employees ko customer data leak kiye bina GenAI assistant use karne kaise doge?"</p><p>Strong answer: AI app usage discover karo, ek app sanction karo aur baaki par block ya warn lagao; decryption enable karo; sanctioned app par customer data ke DLP identifiers aur prompt injection aur sensitive data ke AI guardrails jodo, Monitor se shuru karke; events review karo, tune karo, phir Block; users ko train karo. Mention karo ki guardrails model ko injection se bhi bachate hain, sirf data ko leak hone se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DLP rule = data identifiers + destinations + action (Block ya Monitor) + severity.</li>
<li>Real-time DLP inline hai aur decryption chahiye; SaaS API DLP data at rest scan karta hai.</li>
<li>AI guardrails prompts mein Prompt Injection, Sensitive Data aur Harmful Content check karte hain.</li>
<li>Monitor se shuru karo, false positives tune karo, phir Block.</li>
<li>Har AI tool block karne ki jagah ek AI app sanction aur guard karo.</li>
</ul></div>
`}};export{e as default};