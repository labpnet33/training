var e={id:`collections-pagination-and-limits`,h:{en:`Collections, pagination, limits and safe-change habits`,hi:`Collections, pagination, limits aur safe-change aadatein`},body:{en:`
<h3>Beyond one script</h3>
<p>As your use of the API grows, three questions appear: how do I <b>organise and share</b> my requests, what happens when an answer is <b>too big</b> or I send <b>too many requests</b>, and how do I stay <b>safe</b> when a script changes many networks? This chapter answers them at concept level. Exact numbers and parameter names come from the vendor documentation.</p>

<h3>Postman-style collections and environment variables</h3>
<p>Tools such as Postman let you try API requests without writing code. A <b>collection</b> is a saved, named group of requests, for example "Bharat Retail Co: read" and "Bharat Retail Co: change". Each saved request has a method, a path, headers and an optional body. You can share the collection with the team so everybody tests the same calls. An <b>environment</b> holds <b>variables</b> that differ between setups, so you never edit each request by hand:</p>
<table class="cmp"><tr><th>Variable</th><th>Example value</th><th>Used in</th></tr>
<tr><td>baseUrl</td><td>the base URL (scheme + 203.0.113.80 + /api/v1)</td><td>front of every request</td></tr>
<tr><td>apiKey</td><td>stored as a secret, not shared</td><td>Authorization header</td></tr>
<tr><td>orgId</td><td>1001</td><td>/organizations/{{orgId}}/networks</td></tr>
<tr><td>networkId</td><td>mum, blr or del</td><td>/networks/{{networkId}}/devices</td></tr></table>
<p>Switching the network id from <code>mum</code> to <code>blr</code> repeats the whole collection for Bengaluru. This is the same idea as variables in Python: <code>BASE</code>, <code>HEADERS</code> and <code>net_id</code>. A tool-created collection never replaces understanding the status codes. Keep the key as a secret variable and never export it with a shared collection.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Collection, environment and results">
<rect x="10" y="20" width="190" height="80" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Collection</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">list networks</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">list devices, VLANs</text>
<rect x="225" y="20" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">baseUrl, apiKey</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">orgId, networkId</text>
<rect x="440" y="20" width="190" height="80" rx="10" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Run</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">status codes</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">JSON answers</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="125" width="620" height="45" rx="8" fill="#ddd6fe"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">Change the environment, run the same collection on another network</text>
<rect x="10" y="180" width="620" height="40" rx="8" fill="#fecaca"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">Keep the key as a secret variable; do not share it in exports</text>
</svg><p class="cap">The same requests run against different values.</p></div>

<h3>Pagination</h3>
<p>If a list has thousands of items, the server does not send them all at once. It sends a <b>page</b>, for example the first group of items, and tells you how to ask for the next page. This is <b>pagination</b>. A script that reads only the first page silently misses the rest. The idea in code is a loop that keeps asking until there is no next page:</p>
<pre class="code">items = []
page_url = BASE + "/organizations/1001/devices/statuses"
while page_url:
    r = requests.get(page_url, headers=HEADERS)
    r.raise_for_status()
    items.extend(r.json())
    page_url = next_page_from(r)    <span class="c"># how this works: see the vendor documentation</span>
print(len(items), "devices in total")</pre>
<p>How a real product signals the next page (a header, a field in the answer, a cursor) differs, so check the vendor documentation. Our lab lists are small, but the habit of checking "did I get everything?" is the point.</p>

<h3>Rate limiting</h3>
<p>A <b>rate limit</b> stops one client from sending too many requests in a short time. If you exceed it the server refuses with an error (commonly <b>429 Too Many Requests</b>) and often says how long to wait. Good scripts: ask for the data in few calls (use the statuses call instead of one call per device), pause between calls, and when told to wait, wait and retry. Never hammer a limit in a tight loop. The actual limit numbers are in the vendor documentation.</p>
<pre class="code">import time

r = requests.get(url, headers=HEADERS)
if r.status_code == 429:
    time.sleep(5)            <span class="c"># wait, then try again</span>
    r = requests.get(url, headers=HEADERS)</pre>

<h3>Idempotence: safe to run twice?</h3>
<p>A request is <b>idempotent</b> if running it twice leaves the same result as running it once. GET is idempotent. A PUT that sets a VLAN name to "Guest-WiFi" is idempotent: the second run changes nothing more. A POST that creates a new VLAN is usually <b>not</b>: the second run may fail with a conflict, or create a duplicate. Write scripts so they are safe to re-run: check what exists first, then create only what is missing.</p>

<h3>Dry-run and backup before change</h3>
<ol>
<li><b>Backup:</b> GET the current settings and save them to a dated file before any PUT.</li>
<li><b>Dry-run:</b> run the script in a mode that only prints what it would send and changes nothing.</li>
<li><b>Small first:</b> apply to one test network before all of them.</li>
<li><b>Verify:</b> GET after the change and compare to what you wanted.</li>
<li><b>Roll back:</b> if wrong, PUT the saved backup.</li>
</ol>
<pre class="code">import json, datetime

DRY_RUN = True                       <span class="c"># flip to False only after review</span>
url = BASE + "/networks/blr/appliance/firewall/l3Rules"

before = requests.get(url, headers=HEADERS).json()
stamp = datetime.date.today().isoformat()
with open("backup-blr-l3-" + stamp + ".json", "w") as f:
    json.dump(before, f, indent=2)

new_body = {"rules": before["rules"]}   <span class="c"># edited list goes here</span>
if DRY_RUN:
    print("DRY RUN: would PUT", len(new_body["rules"]), "rules to", url)
else:
    r = requests.put(url, headers=HEADERS, json=new_body)
    print(r.status_code)</pre>
<pre class="out">DRY RUN: would PUT 4 rules to /networks/blr/appliance/firewall/l3Rules</pre>

<div class="eg"><p><b>Worked example.</b> The team needs a guest deny rule on all three networks. The script loops over mum, blr and del with DRY_RUN True: it prints three lines saying what would be sent. After review, the engineer runs it for blr only (a small start), checks the hit counters, then runs it for the other two. Each run saved a backup file first, so any network can be restored in seconds.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> Collections, environment variables, pagination and dry-run change nothing. A real PUT or POST changes live configuration immediately. The backup and verify steps are what protect the network.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Reading only the first page; ignoring 429 and retrying instantly; exporting a collection that contains the key; running a write script on all networks at once without a dry-run; no backup file.</p></div>
<div class="exam"><p><b>Exam trap.</b> GET and PUT are normally idempotent; POST is normally not. Pagination is about large answers; rate limiting is about too many requests.</p></div>

<div class="scn"><h4>One page only</h4><p>A report script showed 100 devices for an organization that really had 340. Nobody noticed for weeks until a missing branch was not in the report. The cause: the script read only the first page. After adding a loop for the next page and a check that compared the total with the dashboard count, the report was right.</p><p><b>Lesson:</b> always ask "did I get everything?".</p></div>

<div class="iv"><p class="q">"How do you make an automation script safe to run on production?"</p><p>Strong answer: dry-run mode, backup of the current state before writing, test on one network, check every status code, idempotent logic so a re-run is safe, verify after the change, a rollback from the backup, and keys held outside the code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Collections group saved requests; environment variables hold base URL, key and ids.</li>
<li>Pagination returns big lists in pages: loop until done.</li>
<li>Rate limiting: fewer calls, pause, wait and retry on 429.</li>
<li>Idempotent requests are safe to repeat; plain POST often is not.</li>
<li>Backup, dry-run, small first, verify, roll back.</li>
</ul></div>
`,hi:`
<h3>Ek script se aage</h3>
<p>Jaise jaise API ka use badhta hai, teen sawal aate hain: apni requests ko <b>organise aur share</b> kaise karun, jab jawab <b>bahut bada</b> ho ya main <b>bahut zyada requests</b> bhejoon to kya hota hai, aur jab script kai networks badalti hai to <b>safe</b> kaise rahun? Yeh chapter inhe concept level par answer karta hai. Exact numbers aur parameter names vendor documentation se aate hain.</p>

<h3>Postman-style collections aur environment variables</h3>
<p>Postman jaise tools bina code likhe API requests try karne dete hain. <b>Collection</b> saved requests ka named group hai, jaise "Bharat Retail Co: read" aur "Bharat Retail Co: change". Har saved request mein method, path, headers aur optional body hoti hai. Aap collection ko team ke saath share kar sakte ho taaki sab wahi calls test karein. <b>Environment</b> mein woh <b>variables</b> hote hain jo setups ke beech badalte hain, taaki har request haath se edit na karni pade:</p>
<table class="cmp"><tr><th>Variable</th><th>Example value</th><th>Kahan use hota hai</th></tr>
<tr><td>baseUrl</td><td>base URL (scheme + 203.0.113.80 + /api/v1)</td><td>har request ke aage</td></tr>
<tr><td>apiKey</td><td>secret ke roop mein, share nahi</td><td>Authorization header</td></tr>
<tr><td>orgId</td><td>1001</td><td>/organizations/{{orgId}}/networks</td></tr>
<tr><td>networkId</td><td>mum, blr ya del</td><td>/networks/{{networkId}}/devices</td></tr></table>
<p>Network id ko <code>mum</code> se <code>blr</code> karne par poori collection Bengaluru ke liye repeat hoti hai. Yeh Python ke variables jaisa hi idea hai: <code>BASE</code>, <code>HEADERS</code> aur <code>net_id</code>. Tool se bani collection status codes samajhne ki jagah nahi leti. Key ko secret variable mein rakho aur shared collection ke saath kabhi export mat karo.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Collection, environment aur results">
<rect x="10" y="20" width="190" height="80" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Collection</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">networks list</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="12">devices, VLANs list</text>
<rect x="225" y="20" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">baseUrl, apiKey</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="12">orgId, networkId</text>
<rect x="440" y="20" width="190" height="80" rx="10" fill="#fde68a"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Run</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">status codes</text><text x="535" y="86" text-anchor="middle" class="svg-muted" font-size="12">JSON jawab</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="125" width="620" height="45" rx="8" fill="#ddd6fe"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">Environment badlo, wahi collection doosre network par chalao</text>
<rect x="10" y="180" width="620" height="40" rx="8" fill="#fecaca"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">Key ko secret variable rakho; exports mein share mat karo</text>
</svg><p class="cap">Wahi requests alag values ke saath chalti hain.</p></div>

<h3>Pagination</h3>
<p>Agar list mein hazaaron items hain to server sab ek saath nahi bhejta. Woh ek <b>page</b> bhejta hai, jaise items ka pehla group, aur batata hai agla page kaise maangna hai. Yeh <b>pagination</b> hai. Jo script sirf pehla page padhti hai woh baaki chupchaap miss kar deti hai. Code mein idea ek loop hai jo tab tak maangta rehta hai jab tak agla page na ho:</p>
<pre class="code">items = []
page_url = BASE + "/organizations/1001/devices/statuses"
while page_url:
    r = requests.get(page_url, headers=HEADERS)
    r.raise_for_status()
    items.extend(r.json())
    page_url = next_page_from(r)    <span class="c"># yeh kaise kaam karta hai: vendor documentation dekho</span>
print(len(items), "devices in total")</pre>
<p>Real product agla page kaise signal karta hai (header, jawab ka field, cursor) alag hota hai, isliye vendor documentation check karo. Humare lab ki lists chhoti hain, lekin "kya mujhe sab mila?" check karne ki aadat hi asli baat hai.</p>

<h3>Rate limiting</h3>
<p><b>Rate limit</b> ek client ko chhote time mein bahut zyada requests bhejne se rokta hai. Agar aap limit paar karte ho to server error se refuse karta hai (aam taur par <b>429 Too Many Requests</b>) aur aksar batata hai kitna wait karna hai. Achhi scripts: kam calls mein data maangti hain (har device ke liye ek call ki jagah statuses call), calls ke beech pause leti hain, aur wait karne ko kaha jaye to wait karke retry karti hain. Limit ko tight loop mein kabhi mat peeto. Asli limit numbers vendor documentation mein hain.</p>
<pre class="code">import time

r = requests.get(url, headers=HEADERS)
if r.status_code == 429:
    time.sleep(5)            <span class="c"># wait karo, phir dobara try</span>
    r = requests.get(url, headers=HEADERS)</pre>

<h3>Idempotence: kya do baar chalana safe hai?</h3>
<p>Request <b>idempotent</b> hai agar use do baar chalane ka result ek baar chalane jaisa hi rahe. GET idempotent hai. VLAN ka naam "Guest-WiFi" set karne wala PUT idempotent hai: doosri run kuch aur nahi badalti. Naya VLAN banane wala POST aam taur par <b>nahi</b> hai: doosri run conflict se fail ho sakti hai, ya duplicate bana sakti hai. Scripts aise likho ki dobara chalana safe ho: pehle check karo kya hai, phir sirf jo missing hai woh banao.</p>

<h3>Change se pehle dry-run aur backup</h3>
<ol>
<li><b>Backup:</b> kisi bhi PUT se pehle current settings GET karke dated file mein save karo.</li>
<li><b>Dry-run:</b> script ko aise mode mein chalao jo sirf print kare ki kya bhejegi aur kuch na badle.</li>
<li><b>Pehle chhota:</b> sab se pehle ek test network par lagao.</li>
<li><b>Verify:</b> change ke baad GET karo aur jo chahiye tha usse compare karo.</li>
<li><b>Roll back:</b> galat ho to saved backup PUT karo.</li>
</ol>
<pre class="code">import json, datetime

DRY_RUN = True                       <span class="c"># review ke baad hi False karo</span>
url = BASE + "/networks/blr/appliance/firewall/l3Rules"

before = requests.get(url, headers=HEADERS).json()
stamp = datetime.date.today().isoformat()
with open("backup-blr-l3-" + stamp + ".json", "w") as f:
    json.dump(before, f, indent=2)

new_body = {"rules": before["rules"]}   <span class="c"># edited list yahan aayegi</span>
if DRY_RUN:
    print("DRY RUN: would PUT", len(new_body["rules"]), "rules to", url)
else:
    r = requests.put(url, headers=HEADERS, json=new_body)
    print(r.status_code)</pre>
<pre class="out">DRY RUN: would PUT 4 rules to /networks/blr/appliance/firewall/l3Rules</pre>

<div class="eg"><p><b>Worked example.</b> Team ko teeno networks par guest deny rule chahiye. Script mum, blr aur del par DRY_RUN True ke saath loop chalati hai: teen lines print karti hai ki kya bheja jayega. Review ke baad engineer use sirf blr ke liye chalata hai (chhota shuru), hit counters check karta hai, phir baaki do ke liye chalata hai. Har run ne pehle backup file save ki, isliye koi bhi network seconds mein restore ho sakta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Collections, environment variables, pagination aur dry-run kuch nahi badalte. Asli PUT ya POST live configuration turant badalta hai. Backup aur verify steps hi network ki raksha karte hain.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Sirf pehla page padhna; 429 ignore karke turant retry karna; key wali collection export karna; dry-run ke bina write script sab networks par ek saath chalana; backup file nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> GET aur PUT aam taur par idempotent hain; POST aam taur par nahi. Pagination bade jawab ke baare mein hai; rate limiting bahut zyada requests ke baare mein.</p></div>

<div class="scn"><h4>Sirf ek page</h4><p>Report script ne ek organization ke 100 devices dikhaye jabki asal mein 340 the. Hafton tak kisi ne notice nahi kiya jab tak ek missing branch report mein nahi mila. Wajah: script ne sirf pehla page padha. Agle page ka loop aur dashboard count se total compare karne ka check jodne ke baad report sahi aayi.</p><p><b>Seekh:</b> hamesha poochho "kya mujhe sab mila?".</p></div>

<div class="iv"><p class="q">"Automation script ko production par safe kaise banate ho?"</p><p>Strong answer: dry-run mode, likhne se pehle current state ka backup, ek network par test, har status code check, idempotent logic taaki re-run safe ho, change ke baad verify, backup se rollback, aur keys code ke bahar.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Collections saved requests group karti hain; environment variables base URL, key aur ids rakhte hain.</li>
<li>Pagination bade lists ko pages mein deta hai: khatam hone tak loop.</li>
<li>Rate limiting: kam calls, pause, 429 par wait karke retry.</li>
<li>Idempotent requests repeat karne mein safe hain; plain POST aksar nahi.</li>
<li>Backup, dry-run, pehle chhota, verify, roll back.</li>
</ul></div>
`}};export{e as default};