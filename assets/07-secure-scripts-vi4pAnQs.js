var e={id:`secure-scripts`,h:{en:`Data handling and secure coding habits for automation scripts`,hi:`Data handling aur automation scripts ke liye secure coding habits`},body:{en:`
<p>Network engineers write scripts that log in to devices, call controller APIs and move configuration around. These scripts are small, so they are often written fast and shared widely. They also hold some of the most powerful credentials in the company. This chapter turns the ideas of chapters 2 to 6 into a short list of habits for the scripts you write, and adds the data-handling rules that apply to personal and sensitive information.</p>

<h3>Analogy: the master key on the key ring</h3>
<p>A facilities contractor with a master key must lock the van, carry only the keys needed for today's building, never copy the key without a record and never write the building's alarm code on the key tag. Your automation script is that contractor, and the habits below are the contractor's rules.</p>

<h3>The ten habits</h3>
<ol>
<li><b>No hard-coded credentials.</b> Passwords, tokens and keys come from the environment or a secret manager (chapter 2). The script contains names, never values.</li>
<li><b>Verify TLS.</b> Leave certificate verification on. If you use a private CA, give the script the CA bundle (chapter 3). <code>verify=False</code> and <code>curl -k</code> are findings in any review.</li>
<li><b>Least-privilege API accounts.</b> A reporting script gets a read-only role; a script that changes VLANs gets exactly the rights to change VLANs. One account per script so logs say who did what, and so you can revoke one without breaking the others.</li>
<li><b>Validate everything you read.</b> Data from a spreadsheet, a ticket, an API or a device is input. Check type, range and format before putting it in a command or a template (chapter 5).</li>
<li><b>Never build shell commands from strings.</b> Use libraries and argument lists, not <code>os.system</code> with pasted text.</li>
<li><b>Set timeouts.</b> A request without a timeout can hang a pipeline forever; a hung job is an availability problem.</li>
<li><b>Log what happened, not the secret.</b> Record who, what, where, when and the result; never record passwords, tokens or full request headers.</li>
<li><b>Handle errors without leaking.</b> Show a short message to the user; keep the detail in the log. Do not print a traceback that contains a token in a URL.</li>
<li><b>Keep dependencies small and pinned.</b> Fewer libraries, fixed versions, a scan in CI (chapter 10).</li>
<li><b>Dry-run first.</b> Let the script show what it would change; require an explicit flag to apply. It prevents the "right script, wrong device list" accident.</li>
</ol>

<h3>A script that follows the habits</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import logging, os, sys
import requests

log = logging.getLogger("nk-backup")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

BASE  = os.environ.get("NK_BASE_URL", "h&#116;tps://nms.nwk.example/api/v1")
TOKEN = os.environ.get("NK_API_TOKEN")
if not TOKEN:
    sys.exit("NK_API_TOKEN is not set")              <span class="c"># fail early, say nothing about the value</span>

def fetch_config(host: str) -&gt; str:
    r = requests.get(
        BASE + "/config/" + host,
        headers={"Authorization": "Bearer " + TOKEN},
        timeout=10,                                  <span class="c"># never wait forever</span>
    )                                                <span class="c"># TLS verified by default</span>
    r.raise_for_status()
    log.info("fetched config host=%s bytes=%d", host, len(r.text))   <span class="c"># no token in the log</span>
    return r.text</pre>
<p>Notice what is missing: no password in the file, no <code>verify=False</code>, no print of the headers. Notice what is there: a timeout, a clear failure when the secret is absent, and a log line that is useful to an investigator and useless to a thief.</p>

<h3>Logging without leaking</h3>
<p>Logs are copied to many places (a central server, a ticket, a chat) and kept for months, so a secret that reaches a log has escaped. Use these rules: log identifiers, not credentials; mask any value that looks like a token before it is written; never log the full URL if secrets can appear in the query string; and never enable debug logging of whole requests in production.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import logging, re

class Redact(logging.Filter):
    PATTERN = re.compile(r"(Bearer\\s+|token=|password=)[^\\s&amp;]+", re.I)
    def filter(self, record):
        record.msg = self.PATTERN.sub(r"\\1***", str(record.msg))
        return True

logging.getLogger().addFilter(Redact())</pre>
<p>A filter is a safety net, not a licence to log secrets: the first rule is not to pass them to the logger at all.</p>

<h3>Data handling: personal and sensitive data</h3>
<dl class="terms">
<dt>PII (personally identifiable information)</dt><dd>Data that identifies a person: name with address, phone number, email, government ID, employee number, and often an IP address or device ID when linked to a person. Rules and laws (such as India's data-protection law, the GDPR in Europe) require you to protect it and to tell people how it is used.</dd>
<dt>Data minimisation</dt><dd>Collect and keep only what you need, for as long as you need it. Data you never stored cannot leak.</dd>
<dt>Classification</dt><dd>Label data (public, internal, confidential, restricted) so each class gets the right controls: encryption, access list, retention period.</dd>
<dt>Masking and tokenisation</dt><dd>Show or log only part of a value (the last four digits) or replace it with a token, so test systems and logs do not carry the real value.</dd>
<dt>Retention and disposal</dt><dd>Delete data when the purpose ends, including old backups and exports on laptops.</dd>
</dl>
<p>In network automation, PII hides in unexpected places: a device inventory with employee names, a configuration backup with SNMP community strings and local passwords, a packet capture with user traffic, a CSV of Wi-Fi users. Treat configuration backups as sensitive: encrypt them, restrict who can read them and do not paste them into public tools.</p>
<div class="eg"><p><b>Worked example.</b> A nightly script saves 200 switch configurations to a share. Applying the habits: the API account is read-only; its token comes from the environment of the job; TLS is verified against the internal CA; the files are written with mode 600 into a folder only the network team can read; filenames contain the hostname and date but no passwords; the log line says "saved sw-core1 14202 bytes"; and backups older than 90 days are deleted. Nothing in the repository, nothing in the log, nothing world-readable.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe script data flow">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="12">Secret store</text><text x="80" y="114" text-anchor="middle" class="svg-muted" font-size="11">token, key</text>
<rect x="210" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="270" y="96" text-anchor="middle" class="svg-ink" font-size="12">Script</text><text x="270" y="114" text-anchor="middle" class="svg-muted" font-size="11">validate, timeout</text>
<rect x="400" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="60" text-anchor="middle" class="svg-ink" font-size="12">API over TLS</text>
<rect x="400" y="120" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="150" text-anchor="middle" class="svg-ink" font-size="12">Log (no secrets)</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#fed7aa"/><text x="585" y="96" text-anchor="middle" class="svg-ink" font-size="12">Backup</text><text x="585" y="114" text-anchor="middle" class="svg-muted" font-size="11">mode 600</text>
<line x1="140" y1="100" x2="208" y2="100" stroke="#64748b" stroke-width="2"/><line x1="330" y1="90" x2="398" y2="60" stroke="#64748b" stroke-width="2"/><line x1="330" y1="110" x2="398" y2="140" stroke="#64748b" stroke-width="2"/><line x1="510" y1="55" x2="560" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The secret flows in from the store; only safe things flow out to the log and to storage.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Printing the whole response "to debug" and leaving the line in; sharing one admin token among five scripts; committing a configuration backup to a repository; using a personal account for a job that keeps running after you change teams; no timeout; ignoring TLS errors.</p></div>
<div class="exam"><p><b>Exam traps.</b> Least privilege applies to API accounts and tokens as well as to people. A log must record security-relevant events <i>without</i> the credentials. Masking hides part of a value; encryption protects the whole value and can be reversed with a key.</p></div>

<div class="scn"><h4>The debug line that leaked the token</h4><p>A support engineer added <code>print(headers)</code> to find out why a call returned 401, and the script ran from cron with its output mailed to a shared mailbox. The mail archive now contained a valid bearer token, readable by thirty people. Nobody abused it, but the audit counted it as an exposure: the token was rotated, the print removed, the job moved to a logger with a redaction filter, and a review checklist item "no headers in logs" was added.</p><p><b>Lesson:</b> debugging output is output; it travels as far as logs travel.</p></div>

<div class="iv"><p class="q">"What security habits do you apply when you write a script that calls a network API?"</p><p>No hard-coded credentials (environment or secret manager), TLS verification on, a read-only or narrowly scoped account, input validation, no shell command building, timeouts, logging without secrets, pinned and scanned dependencies, and a dry-run mode. Mention that you would rotate any credential that ever appeared in code or a log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scripts hold powerful credentials: read them from the environment, verify TLS, use least-privilege accounts.</li>
<li>Validate input, avoid shell strings, set timeouts, support dry-run.</li>
<li>Log events and identifiers, never secrets; use a redaction filter as a safety net only.</li>
<li>Minimise, classify, mask and delete personal data; treat configuration backups as sensitive.</li>
<li>Rotate any credential that was ever exposed in code, chat or logs.</li>
</ul></div>
`,hi:`
<p>Network engineers aisi scripts likhte hain jo devices mein login karti hain, controller APIs call karti hain aur configuration idhar-udhar le jaati hain. Yeh scripts chhoti hoti hain, isliye aksar jaldi likhi aur door tak share ki jaati hain. Saath hi inke paas company ke sabse powerful credentials mein se kuch hote hain. Yeh chapter chapters 2 se 6 ke ideas ko aapki likhi scripts ke liye aadaton ki chhoti list mein badalta hai, aur personal aur sensitive information par lagne wale data-handling rules jodta hai.</p>

<h3>Analogy: key ring par master key</h3>
<p>Master key wale facilities contractor ko van lock karni chahiye, sirf aaj ki building ki chabiyan rakhni chahiye, bina record ke chabi ki copy nahi banani chahiye aur building ka alarm code key tag par nahi likhna chahiye. Aapki automation script woh contractor hai, aur neeche ki aadatein contractor ke rules hain.</p>

<h3>Das aadatein</h3>
<ol>
<li><b>Hard-coded credentials nahi.</b> Passwords, tokens aur keys environment ya secret manager se aate hain (chapter 2). Script mein naam hote hain, values nahi.</li>
<li><b>TLS verify karo.</b> Certificate verification on rakho. Private CA ho to script ko CA bundle do (chapter 3). <code>verify=False</code> aur <code>curl -k</code> kisi bhi review mein finding hain.</li>
<li><b>Least-privilege API accounts.</b> Reporting script ko read-only role; VLANs badalne wali script ko exactly VLAN badalne ke rights. Har script ke liye ek account taaki logs batayein kisne kya kiya, aur ek ko baaki tode bina revoke kar sako.</li>
<li><b>Jo padho sab validate karo.</b> Spreadsheet, ticket, API ya device ka data input hai. Command ya template mein daalne se pehle type, range aur format check karo (chapter 5).</li>
<li><b>Shell commands strings se mat banao.</b> Libraries aur argument lists use karo, paste kiye text ke saath <code>os.system</code> nahi.</li>
<li><b>Timeouts lagao.</b> Timeout ke bina request pipeline ko hamesha ke liye hang kar sakti hai; hung job availability problem hai.</li>
<li><b>Jo hua woh log karo, secret nahi.</b> Kaun, kya, kahan, kab aur result record karo; passwords, tokens ya poore request headers kabhi nahi.</li>
<li><b>Errors bina leak ke handle karo.</b> User ko chhota message dikhao; detail log mein rakho. Aisa traceback print mat karo jisme URL mein token ho.</li>
<li><b>Dependencies chhoti aur pinned rakho.</b> Kam libraries, fixed versions, CI mein scan (chapter 10).</li>
<li><b>Pehle dry-run.</b> Script dikhaye ki woh kya badlegi; apply karne ke liye explicit flag maango. Isse "sahi script, galat device list" accident rukta hai.</li>
</ol>

<h3>Aadaton ko follow karne wali script</h3>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import logging, os, sys
import requests

log = logging.getLogger("nk-backup")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

BASE  = os.environ.get("NK_BASE_URL", "h&#116;tps://nms.nwk.example/api/v1")
TOKEN = os.environ.get("NK_API_TOKEN")
if not TOKEN:
    sys.exit("NK_API_TOKEN is not set")              <span class="c"># jaldi fail, value ke baare mein kuch nahi</span>

def fetch_config(host: str) -&gt; str:
    r = requests.get(
        BASE + "/config/" + host,
        headers={"Authorization": "Bearer " + TOKEN},
        timeout=10,                                  <span class="c"># kabhi hamesha mat ruko</span>
    )                                                <span class="c"># TLS default se verified</span>
    r.raise_for_status()
    log.info("fetched config host=%s bytes=%d", host, len(r.text))   <span class="c"># log mein token nahi</span>
    return r.text</pre>
<p>Dhyan do kya missing hai: file mein password nahi, <code>verify=False</code> nahi, headers ka print nahi. Aur kya hai: timeout, secret na ho to saaf failure, aur ek log line jo investigator ke kaam ki aur chor ke liye bekaar hai.</p>

<h3>Bina leak ke logging</h3>
<p>Logs kai jagah copy hote hain (central server, ticket, chat) aur mahino rakhe jaate hain, isliye jo secret log mein pahunch gaya woh nikal gaya. Yeh rules use karo: identifiers log karo, credentials nahi; token jaisi dikhne wali koi bhi value likhne se pehle mask karo; agar query string mein secrets aa sakte hain to poora URL log mat karo; aur production mein poori requests ka debug logging kabhi on mat karo.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
import logging, re

class Redact(logging.Filter):
    PATTERN = re.compile(r"(Bearer\\s+|token=|password=)[^\\s&amp;]+", re.I)
    def filter(self, record):
        record.msg = self.PATTERN.sub(r"\\1***", str(record.msg))
        return True

logging.getLogger().addFilter(Redact())</pre>
<p>Filter safety net hai, secrets log karne ka licence nahi: pehla rule hai unhe logger ko dena hi nahi.</p>

<h3>Data handling: personal aur sensitive data</h3>
<dl class="terms">
<dt>PII (personally identifiable information)</dt><dd>Woh data jo kisi insaan ko pehchanta hai: address ke saath naam, phone number, email, government ID, employee number, aur aksar IP address ya device ID jab kisi insaan se jude hon. Rules aur laws (jaise India ka data-protection law, Europe ka GDPR) kehte hain ki use protect karo aur logon ko batao ki kaise use hota hai.</dd>
<dt>Data minimisation</dt><dd>Sirf utna collect aur rakho jitna chahiye, jitni der chahiye. Jo data kabhi store hi nahi hua woh leak nahi ho sakta.</dd>
<dt>Classification</dt><dd>Data ko label karo (public, internal, confidential, restricted) taaki har class ko sahi controls mile: encryption, access list, retention period.</dd>
<dt>Masking aur tokenisation</dt><dd>Value ka sirf hissa dikhao ya log karo (aakhri chaar digits) ya use token se badlo, taaki test systems aur logs asli value na ley jaayein.</dd>
<dt>Retention aur disposal</dt><dd>Maksad khatam hone par data delete karo, purane backups aur laptops par exports samet.</dd>
</dl>
<p>Network automation mein PII ajeeb jagahon mein chhupa hota hai: employee names wali device inventory, SNMP community strings aur local passwords wala configuration backup, user traffic wala packet capture, Wi-Fi users ki CSV. Configuration backups ko sensitive maano: encrypt karo, kaun padh sakta hai restrict karo aur public tools mein paste mat karo.</p>
<div class="eg"><p><b>Worked example.</b> Nightly script 200 switch configurations ek share par save karti hai. Aadatein lagane par: API account read-only; uska token job ke environment se aata hai; TLS internal CA se verified; files mode 600 ke saath aise folder mein likhi jaati hain jise sirf network team padh sakti hai; filenames mein hostname aur date hain par passwords nahi; log line kehti hai "saved sw-core1 14202 bytes"; aur 90 din se purane backups delete hote hain. Repository mein kuch nahi, log mein kuch nahi, world-readable kuch nahi.</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe script data flow">
<rect x="20" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="96" text-anchor="middle" class="svg-ink" font-size="12">Secret store</text><text x="80" y="114" text-anchor="middle" class="svg-muted" font-size="11">token, key</text>
<rect x="210" y="70" width="120" height="60" rx="8" fill="#bae6fd"/><text x="270" y="96" text-anchor="middle" class="svg-ink" font-size="12">Script</text><text x="270" y="114" text-anchor="middle" class="svg-muted" font-size="11">validate, timeout</text>
<rect x="400" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="455" y="60" text-anchor="middle" class="svg-ink" font-size="12">API over TLS</text>
<rect x="400" y="120" width="110" height="50" rx="8" fill="#fde68a"/><text x="455" y="150" text-anchor="middle" class="svg-ink" font-size="12">Log (no secrets)</text>
<rect x="540" y="70" width="90" height="60" rx="8" fill="#fed7aa"/><text x="585" y="96" text-anchor="middle" class="svg-ink" font-size="12">Backup</text><text x="585" y="114" text-anchor="middle" class="svg-muted" font-size="11">mode 600</text>
<line x1="140" y1="100" x2="208" y2="100" stroke="#64748b" stroke-width="2"/><line x1="330" y1="90" x2="398" y2="60" stroke="#64748b" stroke-width="2"/><line x1="330" y1="110" x2="398" y2="140" stroke="#64748b" stroke-width="2"/><line x1="510" y1="55" x2="560" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Secret store se andar aata hai; log aur storage mein sirf safe cheezein jaati hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> "Debug ke liye" poora response print karna aur line chhod dena; paanch scripts mein ek admin token share karna; configuration backup repository mein commit karna; aise job ke liye personal account use karna jo team badalne ke baad bhi chalta rahe; timeout nahi; TLS errors ignore karna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Least privilege API accounts aur tokens par bhi lagta hai, sirf logon par nahi. Log ko security-relevant events record karne chahiye <i>bina</i> credentials ke. Masking value ka hissa chhupati hai; encryption poori value protect karta hai aur key se reverse ho sakta hai.</p></div>

<div class="scn"><h4>Debug line jisne token leak kiya</h4><p>Ek support engineer ne yeh dekhne ke liye ki call 401 kyun deti hai <code>print(headers)</code> daal diya, aur script cron se chalti thi jiska output shared mailbox mein mail hota tha. Mail archive mein ab ek valid bearer token tha, jise tees log padh sakte the. Kisi ne misuse nahi kiya, par audit ne ise exposure gina: token rotate hua, print hata, job redaction filter wale logger par gaya, aur review checklist mein "logs mein headers nahi" item joda gaya.</p><p><b>Lesson:</b> debugging output bhi output hai; woh utni door jata hai jitni door logs jaate hain.</p></div>

<div class="iv"><p class="q">"Network API call karne wali script likhte waqt kaunsi security aadatein apnate ho?"</p><p>Hard-coded credentials nahi (environment ya secret manager), TLS verification on, read-only ya narrow scope account, input validation, shell command building nahi, timeouts, secrets ke bina logging, pinned aur scanned dependencies, aur dry-run mode. Batao ki jo credential kabhi code ya log mein dikha use aap rotate karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scripts ke paas powerful credentials hote hain: environment se padho, TLS verify karo, least-privilege accounts use karo.</li>
<li>Input validate karo, shell strings se bacho, timeouts lagao, dry-run support karo.</li>
<li>Events aur identifiers log karo, secrets nahi; redaction filter sirf safety net hai.</li>
<li>Personal data minimise, classify, mask aur delete karo; configuration backups ko sensitive maano.</li>
<li>Jo credential code, chat ya logs mein kabhi expose hua use rotate karo.</li>
</ul></div>
`}};export{e as default};