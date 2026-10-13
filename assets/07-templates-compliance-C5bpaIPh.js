var e={id:`templates-compliance`,h:{en:`Templates, golden configuration and compliance`,hi:`Templates, golden configuration aur compliance`},body:{en:`
<p>A bank prints its cheques from one master design. Every branch fills in only the blanks: account number, amount, date. Nobody redraws the logo or the security pattern by hand. A <b>configuration template</b> is that master design for device config: fixed CLI with a few <b>variables</b> that change per device or per site.</p>

<h3>Templates in Catalyst Center</h3>
<p>Templates live in <b>Template Hub</b> (called <b>Template Editor</b> in older releases), organised in projects, with version history: you <b>commit</b> a version before it can be deployed. Two template languages are supported:</p>
<ul><li><b>Velocity</b> — variables start with a dollar sign, for example <code>ntp server $ntp_server</code>, with <code>#if</code> and <code>#foreach</code> for logic.</li>
<li><b>Jinja2</b> — variables in double braces, for example <code>ntp server {{ ntp_server }}</code>, with <code>{% if %}</code> and <code>{% for %}</code> blocks.</li></ul>
<p>Variables can be typed (string, integer, IP address), given drop-down choices, or <b>bound</b> to data the controller already knows (the device hostname, the site's DNS server). <b>Composite templates</b> chain several small templates in order. A template targets a device family and can be <b>Day-0</b> (onboarding with PnP) or <b>Day-N</b> (changes to managed devices). Templates are attached to <b>network profiles</b>, which are assigned to sites, so provisioning a device applies them; they can also be deployed directly.</p>

<h3>Golden configuration and compliance</h3>
<p>The <b>golden configuration</b> is the approved standard: Design settings plus the templates in a site's profile, plus the golden image. <b>Compliance</b> checks each device against it and marks it <b>COMPLIANT</b> or <b>NON_COMPLIANT</b> (with NOT_APPLICABLE or ERROR where a check cannot run). Real Catalyst Center groups compliance into categories: <b>startup versus running config</b> (unsaved changes), <b>software image</b> (golden or not), <b>network profile / intent</b> (templates and settings still present), <b>critical security advisories</b> (known vulnerabilities for that image) and, where relevant, fabric and application visibility. Compliance runs automatically after changes and on a schedule, and you can run it on demand.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Template, deploy and compliance loop">
<rect x="10" y="70" width="140" height="56" rx="10" fill="#fde68a"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="80" y="111" text-anchor="middle" class="svg-muted" font-size="12">{{ntp_server}}</text>
<rect x="180" y="70" width="120" height="56" rx="10" fill="#bae6fd"/><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="13">Preview</text><text x="240" y="111" text-anchor="middle" class="svg-muted" font-size="12">render per device</text>
<rect x="330" y="70" width="120" height="56" rx="10" fill="#bbf7d0"/><text x="390" y="94" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="390" y="111" text-anchor="middle" class="svg-muted" font-size="12">over SSH</text>
<rect x="480" y="70" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="555" y="94" text-anchor="middle" class="svg-ink" font-size="13">Compliance</text><text x="555" y="111" text-anchor="middle" class="svg-muted" font-size="12">running vs rendered</text>
<line x1="150" y1="98" x2="180" y2="98" stroke="#64748b" stroke-width="2"/><line x1="300" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><line x1="450" y1="98" x2="480" y2="98" stroke="#64748b" stroke-width="2"/>
<path d="M555 126 Q555 175 390 175 Q240 175 240 126" fill="none" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="400" y="192" text-anchor="middle" class="svg-accent" font-size="12">NON_COMPLIANT? redeploy</text>
</svg><p class="cap">Deploy once, then let compliance keep proving the config is still there.</p></div>

<h3>The lab workflow</h3>
<p>The lab controller's <b>Templates</b> page lists templates on the left (NTP-Baseline, Banner-Standard, Syslog-Baseline, plus <b>New template</b>). Pick one and you see its CLI with variables highlighted, a <b>Variables</b> form, <b>Target devices</b> chips (switches are pre-selected), and <b>Preview</b> and <b>Deploy</b> buttons. The <b>Compliance</b> card below has <b>Run compliance</b>. Shell equivalents:</p>
<pre class="code">CTRL&gt; center template show NTP-Baseline
CTRL&gt; center template preview NTP-Baseline ASW1 ntp_server=10.255.0.1
CTRL&gt; center template apply NTP-Baseline switches ntp_server=10.255.0.1</pre>
<pre class="out">! Preview of NTP-Baseline for ASW1
ntp server 10.255.0.1

Deploying template NTP-Baseline ...
  DSW1    SUCCESS  Deployed 1 line(s)
  ASW1    SUCCESS  Deployed 1 line(s)
  <span class="hl">ASW2    SUCCESS  Deployed 1 line(s)</span></pre>
<p>Preview without the variable first and the controller refuses to guess: <code>% Missing variable(s): ntp_server</code>. Always preview. Then verify on a device that the intent actually took effect, not just that the line was accepted:</p>
<pre class="code">ASW1# show ntp status</pre>
<pre class="out"><span class="hl">Clock is synchronized, stratum 4, reference is 10.255.0.1</span></pre>
<p>Variables with spaces: in the shell use an underscore, <code>site=Pune_Campus</code>, or type "Pune Campus" in the GUI form.</p>
<pre class="code">CTRL&gt; center template apply Banner-Standard switches site=Pune_Campus
CTRL&gt; center compliance</pre>
<pre class="out">Template         Device  Status
---------------  ------  ---------
NTP-Baseline     DSW1    COMPLIANT
NTP-Baseline     ASW1    COMPLIANT
NTP-Baseline     ASW2    COMPLIANT
Banner-Standard  DSW1    COMPLIANT
Banner-Standard  ASW1    COMPLIANT
Banner-Standard  ASW2    COMPLIANT</pre>

<div class="eg"><p><b>Worked example: catching drift.</b> A colleague troubleshooting ASW2 types <code>no banner motd</code> and forgets. The next compliance run shows:</p>
<pre class="out">Banner-Standard  ASW2    <span class="hl">NON_COMPLIANT</span>
ASW2 is missing (Banner-Standard):
    banner motd #Authorised access only - Pune_Campus#</pre>
<p>Re-deploying only to ASW2 (<code>center template apply Banner-Standard ASW2 site=Pune_Campus</code>) returns it to COMPLIANT. The report told you <i>which device</i>, <i>which template</i> and <i>which line</i>.</p></div>

<h3>Command Runner</h3>
<p>For read-only checks across many devices, Catalyst Center has <b>Command Runner</b>: pick devices, enter <code>show</code> commands (for example <code>show ntp status</code>), and get every output side by side. It is also exposed through the API, so scripts can collect show output without opening SSH sessions themselves. It runs show commands only; changes go through templates.</p>

<div class="warn"><p><b>Common mistakes.</b> One huge template that does everything, so a single typo breaks the whole push; keep templates small and single-purpose (NTP, AAA, banner, syslog). Deploying without preview. Assuming "SUCCESS" means working: the line was accepted, but only verification (NTP synced, banner shown) proves the outcome. Editing a template and forgetting to commit the new version.</p></div>
<div class="exam"><p><b>Exam traps.</b> Template languages: <b>Velocity</b> and <b>Jinja2</b>. Day-0 templates are used by PnP; Day-N templates change managed devices. Compliance compares the device against the intended state; a device can be COMPLIANT for templates and still NON_COMPLIANT for software image or startup-versus-running config.</p></div>

<div class="scn"><h4>The audit that took ten minutes</h4><p>A payments company had to prove to auditors that all 850 switches used TACACS+ and the legal banner. Last year that meant two engineers and a week of spreadsheets. This year they opened the compliance dashboard, filtered by the AAA and banner templates, exported the report showing 847 compliant and 3 non-compliant, re-deployed to the three, re-ran compliance and attached the clean report.</p><p><b>Lesson:</b> templates plus compliance turn "we believe" into "here is the evidence".</p></div>

<div class="iv"><p class="q">"What is configuration drift and how does Catalyst Center help with it?"</p><p>Drift is when a device's running config slowly moves away from the approved standard through manual fixes. Catalyst Center holds the standard as Design settings plus templates in network profiles, deploys them, and runs compliance that flags NON_COMPLIANT devices with the missing lines, so you can re-provision. Mention that compliance also covers image, unsaved config and security advisories.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates are CLI plus variables, written in Velocity or Jinja2, committed before deploy.</li>
<li>Day-0 templates onboard with PnP; Day-N templates change managed devices.</li>
<li>Workflow: fill variables, preview, deploy, verify on the device, check compliance.</li>
<li>Compliance flags drift with the exact missing lines; redeploy fixes it.</li>
<li>Command Runner collects read-only show output from many devices at once.</li>
</ul></div>
`,hi:`
<p>Bank apne cheques ek master design se print karta hai. Har branch sirf khaali jagah bharti hai: account number, amount, date. Koi logo ya security pattern haath se dobara nahi banata. <b>Configuration template</b> device config ke liye wahi master design hai: fixed CLI jismein kuch <b>variables</b> hote hain jo har device ya har site ke hisaab se badalte hain.</p>

<h3>Catalyst Center mein templates</h3>
<p>Templates <b>Template Hub</b> mein rehte hain (purane releases mein naam <b>Template Editor</b> tha), projects mein organised, version history ke saath: deploy karne se pehle aap ek version <b>commit</b> karte ho. Do template languages supported hain:</p>
<ul><li><b>Velocity</b> — variables dollar sign se shuru hote hain, jaise <code>ntp server $ntp_server</code>, logic ke liye <code>#if</code> aur <code>#foreach</code>.</li>
<li><b>Jinja2</b> — variables double braces mein, jaise <code>ntp server {{ ntp_server }}</code>, <code>{% if %}</code> aur <code>{% for %}</code> blocks ke saath.</li></ul>
<p>Variables typed ho sakte hain (string, integer, IP address), drop-down choices ke saath, ya controller ko pehle se pata data se <b>bound</b> (device hostname, site ka DNS server). <b>Composite templates</b> kai chhote templates ko order mein jodte hain. Template ek device family target karta hai aur <b>Day-0</b> (PnP ke saath onboarding) ya <b>Day-N</b> (managed devices mein changes) ho sakta hai. Templates <b>network profiles</b> se attach hote hain, jo sites ko assign hote hain, isliye device provision karne par woh apply hote hain; unhe seedhe deploy bhi kiya ja sakta hai.</p>

<h3>Golden configuration aur compliance</h3>
<p><b>Golden configuration</b> approved standard hai: Design settings plus site ke profile ke templates, plus golden image. <b>Compliance</b> har device ko isse check karta hai aur <b>COMPLIANT</b> ya <b>NON_COMPLIANT</b> mark karta hai (jahan check nahi chal sakta wahan NOT_APPLICABLE ya ERROR). Real Catalyst Center compliance ko categories mein baant-ta hai: <b>startup versus running config</b> (unsaved changes), <b>software image</b> (golden hai ya nahi), <b>network profile / intent</b> (templates aur settings ab bhi maujood hain), <b>critical security advisories</b> (us image ki known vulnerabilities) aur jahan relevant ho, fabric aur application visibility. Compliance changes ke baad aur schedule par automatically chalta hai, aur aap on demand bhi chala sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Template, deploy aur compliance loop">
<rect x="10" y="70" width="140" height="56" rx="10" fill="#fde68a"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="80" y="111" text-anchor="middle" class="svg-muted" font-size="12">{{ntp_server}}</text>
<rect x="180" y="70" width="120" height="56" rx="10" fill="#bae6fd"/><text x="240" y="94" text-anchor="middle" class="svg-ink" font-size="13">Preview</text><text x="240" y="111" text-anchor="middle" class="svg-muted" font-size="12">har device ka render</text>
<rect x="330" y="70" width="120" height="56" rx="10" fill="#bbf7d0"/><text x="390" y="94" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="390" y="111" text-anchor="middle" class="svg-muted" font-size="12">SSH par</text>
<rect x="480" y="70" width="150" height="56" rx="10" fill="#ddd6fe"/><text x="555" y="94" text-anchor="middle" class="svg-ink" font-size="13">Compliance</text><text x="555" y="111" text-anchor="middle" class="svg-muted" font-size="12">running vs rendered</text>
<line x1="150" y1="98" x2="180" y2="98" stroke="#64748b" stroke-width="2"/><line x1="300" y1="98" x2="330" y2="98" stroke="#64748b" stroke-width="2"/><line x1="450" y1="98" x2="480" y2="98" stroke="#64748b" stroke-width="2"/>
<path d="M555 126 Q555 175 390 175 Q240 175 240 126" fill="none" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="400" y="192" text-anchor="middle" class="svg-accent" font-size="12">NON_COMPLIANT? dobara deploy</text>
</svg><p class="cap">Ek baar deploy karo, phir compliance ko prove karte rehne do ki config ab bhi wahan hai.</p></div>

<h3>Lab workflow</h3>
<p>Lab controller ka <b>Templates</b> page left mein templates list karta hai (NTP-Baseline, Banner-Standard, Syslog-Baseline, plus <b>New template</b>). Ek chuno to uski CLI variables highlighted ke saath dikhti hai, ek <b>Variables</b> form, <b>Target devices</b> chips (switches pehle se selected), aur <b>Preview</b> aur <b>Deploy</b> buttons. Neeche <b>Compliance</b> card mein <b>Run compliance</b> hai. Shell equivalents:</p>
<pre class="code">CTRL&gt; center template show NTP-Baseline
CTRL&gt; center template preview NTP-Baseline ASW1 ntp_server=10.255.0.1
CTRL&gt; center template apply NTP-Baseline switches ntp_server=10.255.0.1</pre>
<pre class="out">! Preview of NTP-Baseline for ASW1
ntp server 10.255.0.1

Deploying template NTP-Baseline ...
  DSW1    SUCCESS  Deployed 1 line(s)
  ASW1    SUCCESS  Deployed 1 line(s)
  <span class="hl">ASW2    SUCCESS  Deployed 1 line(s)</span></pre>
<p>Pehle bina variable ke preview karo to controller guess karne se mana kar deta hai: <code>% Missing variable(s): ntp_server</code>. Hamesha preview karo. Phir device par verify karo ki intent sach mein lagu hua, sirf yeh nahi ki line accept hui:</p>
<pre class="code">ASW1# show ntp status</pre>
<pre class="out"><span class="hl">Clock is synchronized, stratum 4, reference is 10.255.0.1</span></pre>
<p>Space wale variables: shell mein underscore use karo, <code>site=Pune_Campus</code>, ya GUI form mein "Pune Campus" type karo.</p>
<pre class="code">CTRL&gt; center template apply Banner-Standard switches site=Pune_Campus
CTRL&gt; center compliance</pre>
<pre class="out">Template         Device  Status
---------------  ------  ---------
NTP-Baseline     DSW1    COMPLIANT
NTP-Baseline     ASW1    COMPLIANT
NTP-Baseline     ASW2    COMPLIANT
Banner-Standard  DSW1    COMPLIANT
Banner-Standard  ASW1    COMPLIANT
Banner-Standard  ASW2    COMPLIANT</pre>

<div class="eg"><p><b>Worked example: drift pakadna.</b> Ek colleague ASW2 troubleshoot karte hue <code>no banner motd</code> type karta hai aur bhool jaata hai. Agla compliance run dikhata hai:</p>
<pre class="out">Banner-Standard  ASW2    <span class="hl">NON_COMPLIANT</span>
ASW2 is missing (Banner-Standard):
    banner motd #Authorised access only - Pune_Campus#</pre>
<p>Sirf ASW2 par dobara deploy (<code>center template apply Banner-Standard ASW2 site=Pune_Campus</code>) use wapas COMPLIANT kar deta hai. Report ne aapko bataya <i>kaunsa device</i>, <i>kaunsa template</i> aur <i>kaunsi line</i>.</p></div>

<h3>Command Runner</h3>
<p>Kai devices par read-only checks ke liye Catalyst Center mein <b>Command Runner</b> hai: devices chuno, <code>show</code> commands daalo (jaise <code>show ntp status</code>), aur har output side by side pao. Yeh API se bhi exposed hai, taaki scripts khud SSH sessions khole bina show output collect kar sakein. Yeh sirf show commands chalata hai; changes templates se jaate hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ek bahut bada template jo sab kuch kare, taaki ek typo poora push tod de; templates chhote aur ek kaam wale rakho (NTP, AAA, banner, syslog). Bina preview deploy karna. Yeh maan lena ki "SUCCESS" matlab kaam kar raha hai: line accept hui, lekin sirf verification (NTP synced, banner dikha) outcome prove karta hai. Template edit karke naya version commit karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam traps.</b> Template languages: <b>Velocity</b> aur <b>Jinja2</b>. Day-0 templates PnP use karta hai; Day-N templates managed devices badalte hain. Compliance device ko intended state se compare karta hai; ek device templates ke liye COMPLIANT hote hue bhi software image ya startup-versus-running config ke liye NON_COMPLIANT ho sakta hai.</p></div>

<div class="scn"><h4>Das minute ka audit</h4><p>Ek payments company ko auditors ko prove karna tha ki saare 850 switches TACACS+ aur legal banner use karte hain. Pichhle saal iska matlab tha do engineers aur ek hafte ki spreadsheets. Is saal unhone compliance dashboard khola, AAA aur banner templates se filter kiya, report export ki jismein 847 compliant aur 3 non-compliant the, teeno par dobara deploy kiya, compliance dobara chalaya aur saaf report attach kar di.</p><p><b>Lesson:</b> templates plus compliance "humein lagta hai" ko "yeh raha saboot" mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Configuration drift kya hai aur Catalyst Center isme kaise madad karta hai?"</p><p>Drift tab hota hai jab manual fixes ki wajah se device ki running config dheere dheere approved standard se door chali jaati hai. Catalyst Center standard ko Design settings plus network profiles ke templates ke roop mein rakhta hai, unhe deploy karta hai, aur compliance chalata hai jo NON_COMPLIANT devices ko missing lines ke saath flag karta hai, taaki aap re-provision kar sako. Batao ki compliance image, unsaved config aur security advisories bhi cover karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Templates CLI plus variables hain, Velocity ya Jinja2 mein likhe, deploy se pehle commit.</li>
<li>Day-0 templates PnP ke saath onboard karte hain; Day-N templates managed devices badalte hain.</li>
<li>Workflow: variables bharo, preview, deploy, device par verify, compliance check.</li>
<li>Compliance drift ko exact missing lines ke saath flag karta hai; dobara deploy se fix.</li>
<li>Command Runner ek saath kai devices se read-only show output collect karta hai.</li>
</ul></div>
`}};export{e as default};