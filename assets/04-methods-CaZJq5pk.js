var e={id:`methods`,h:{en:`Methods: what do you want to do?`,hi:`Methods: aap karna kya chahte ho?`},body:{en:`

<p>The URL says <i>which</i> data. The <b>method</b> (also called the verb) says <i>what to do</i> with it. Five methods cover almost everything you will do on a network device. Think of them as the family of CLI actions you already know: show, configure, no.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Five verbs act on one resource: read, create, replace, modify and remove."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="250" y="80" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">Resource</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">interface=Loopback50</text><rect x="10" y="10" width="140" height="40" rx="10" fill="#bbf7d0"/><text x="80" y="35" text-anchor="middle" class="svg-ink" font-size="14">GET</text><rect x="10" y="70" width="140" height="40" rx="10" fill="#fde68a"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="14">POST</text><rect x="10" y="130" width="140" height="40" rx="10" fill="#fed7aa"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="14">PUT</text><rect x="490" y="10" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="14">PATCH</text><rect x="490" y="70" width="140" height="40" rx="10" fill="#fecaca"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="14">DELETE</text><line x1="150" y1="30" x2="250" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="90" x2="250" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="150" x2="250" y2="125" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="30" x2="390" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="90" x2="390" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">read</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">create in a list</text><text x="80" y="182" text-anchor="middle" class="svg-muted" font-size="12">replace whole</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">change some fields</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">remove</text></svg><p class="cap">Five verbs act on one resource: read, create, replace, modify and remove.</p></div>

<h3>The five methods</h3>
<table class="cmp"><tr><th>Method</th><th>Meaning</th><th>CLI feeling</th><th>Success code</th></tr>
<tr><td><b>GET</b></td><td>Read</td><td><code>show</code></td><td>200 OK + data</td></tr>
<tr><td><b>POST</b></td><td>Create a new child inside a list or container</td><td>add a new loopback</td><td>201 Created</td></tr>
<tr><td><b>PUT</b></td><td>Replace the whole resource (create it if missing)</td><td>default the interface, then configure it again</td><td>201 Created, or 204 No Content</td></tr>
<tr><td><b>PATCH</b></td><td>Change only the fields you send; the rest stays</td><td>one interface command</td><td>204 No Content</td></tr>
<tr><td><b>DELETE</b></td><td>Remove it</td><td><code>no interface Loopback50</code></td><td>204 No Content</td></tr></table>

<h3>Two words that matter: safe and idempotent</h3>
<p>A method is <b>safe</b> if it never changes anything. Only GET is safe, so a GET is always fine to try. A method is <b>idempotent</b> if repeating the same request leaves the system in the same state as running it once. GET, PUT, PATCH (when it sets values) and DELETE are idempotent. POST is not: sending it twice would try to create two things. This matters for automation: if a call times out, you can re-send an idempotent call without fear.</p>

<h3>GET and PATCH on a real router</h3>
<p>PATCH changes one value without touching the rest. The body is a small JSON object whose key is the leaf name with its module prefix:</p>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F1/description -u apiuser:Api@2026 -d '{"ietf-interfaces:description": "WAN to Hyderabad"}'
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<p>204 means "done, nothing to send back". Never stop at that: confirm with a GET, and then on the router itself.</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0%2F1/description -u apiuser:Api@2026
HTTP/1.1 200 OK
Content-Type: application/yang-data+json
ETag: "d13smb"

{
<span class="hl">  "ietf-interfaces:description": "WAN to Hyderabad"</span>
}</pre>
<pre class="out">R1# show interfaces description
Interface                      Status         Protocol Description
Gi0/0                          up             up       MGMT-LAN
<span class="hl">Gi0/1                          up             up       WAN to Hyderabad</span>
Gi0/2                          admin down     down     
Gi0/3                          admin down     down     
Lo0                            up             up       </pre>

<h3>PUT, POST and DELETE: create, repeat, remove</h3>
<p>For bigger bodies, keep the JSON in a file and send it with <code>-d @file</code>. Here is a whole new loopback in <code>lo50.json</code>:</p>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "Loopback50",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "50.50.50.50",
          "netmask": "255.255.255.255"
        }
      ]
    }
  }
}</pre>
<pre class="out">AUTO&gt; json validate lo50.json
<span class="hl">lo50.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:interface)</span></pre>
<p>PUT to the address of the new interface. The first time it <b>creates</b> the interface (201 Created, with a <code>Location</code> header that is the new address). The second time it <b>replaces</b> it with identical data (204 No Content). Same request, safe to repeat:</p>
<pre class="out">AUTO&gt; rest PUT .../interface=Loopback50 -u netops:NK@2026 -d @lo50.json
<span class="hl">HTTP/1.1 201 Created</span>
Location: h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback50</pre>
<pre class="out">AUTO&gt; rest PUT .../interface=Loopback50 -u netops:NK@2026 -d @lo50.json
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<p>POST is different. You send it to the <b>parent</b> (the interfaces container), and the new thing is named inside the body. The second identical POST fails because the object exists:</p>
<pre class="out">AUTO&gt; rest POST .../ietf-interfaces:interfaces -u netops:NK@2026 -d @lo51.json
<span class="hl">HTTP/1.1 201 Created</span>
Location: h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces</pre>
<pre class="out">AUTO&gt; rest POST .../ietf-interfaces:interfaces -u netops:NK@2026 -d @lo51.json
<span class="hl">HTTP/1.1 409 Conflict</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "data-exists",
<span class="hl">        "error-message": "interface Loopback51 already exists"</span>
      }
    ]
    ...</pre>
<p>DELETE removes it. The first call returns 204. Repeating it returns 404 because there is nothing left to delete. The end state is the same, which is the point of being idempotent, but the status code is honest about what happened:</p>
<pre class="out">AUTO&gt; rest DELETE .../interface=Loopback51 -u netops:NK@2026
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<pre class="out">AUTO&gt; rest DELETE .../interface=Loopback51 -u netops:NK@2026
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
    ...</pre>

<h3>PUT or PATCH?</h3>
<p>PATCH is the polite way to change one thing: fields you do not mention stay as they were. PUT says "this is the complete truth about this resource": whatever you leave out of the body is removed. Use PATCH to tweak, PUT to create or to reset a resource to exactly the data you hold.</p>

<div class="eg"><p><b>Worked example.</b> A change request says: "Rename the WAN description to WAN to Hyderabad." You send a PATCH to the description leaf (204), a GET on the same leaf to read the new value, and <code>show interfaces description</code> on the router. Three checks, one change. Had you used PUT on the whole interface with only a description in the body, you could have wiped its IP address.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) POST to a single value such as a description leaf: it is not a container and returns 405. (2) PUT with a partial body that removes the rest of the resource. (3) Assuming 204 means "verified". (4) Sending a POST twice and creating duplicates on APIs that allow them.</p></div>
<div class="exam"><p><b>Exam trap.</b> POST creates, PUT replaces (and creates if missing), PATCH merges, DELETE removes. GET is safe; GET, PUT, PATCH and DELETE are idempotent; POST is not. 201 is for creation, 204 for success without a body.</p></div>

<div class="scn"><h4>The PUT that removed an address</h4><p>An engineer wanted to disable an interface and sent a PUT to its address with a body that contained only <code>"enabled": false</code>. The reply was a clean 204. A minute later the monitoring showed the interface had lost its IP address too. PUT had replaced the entire interface with the little body. The correct call was a PATCH to the <code>enabled</code> leaf, or a PUT with the complete object.</p><p><b>Lesson:</b> know whether you are merging or replacing before you press Enter.</p></div>

<div class="iv"><p class="q">"What is the difference between PUT and PATCH, and between PUT and POST?"</p><p>PUT replaces the whole resource at a known address and is idempotent; PATCH merges only the fields sent. POST creates a new child under a parent, the server or the body decides the name, and repeating it is not safe. Use GET to verify, because 2xx only says the server accepted the request.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GET reads, POST creates, PUT replaces, PATCH modifies some fields, DELETE removes.</li>
<li>GET is safe; GET, PUT, PATCH and DELETE are idempotent; POST is not.</li>
<li>PUT returns 201 when it creates and 204 when it replaces; POST returns 201; DELETE returns 204.</li>
<li>Duplicate POST gives 409 Conflict; DELETE of a missing object gives 404.</li>
<li>Always verify a change with a GET and on the device.</li>
</ul></div>

`,hi:`

<p>URL batata hai <i>kaunsa</i> data. <b>Method</b> (ise verb bhi kehte hain) batata hai us data ke saath <i>kya karna hai</i>. Paanch methods network device par lagbhag sab kuch kar dete hain. Inhe un CLI actions ka parivaar samjho jo aap jaante ho: show, configure, no.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Paanch verbs ek resource par kaam karte hain: padhna, banana, replace, badalna aur hatana."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="250" y="80" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="107" text-anchor="middle" class="svg-ink" font-size="14">Resource</text><text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">interface=Loopback50</text><rect x="10" y="10" width="140" height="40" rx="10" fill="#bbf7d0"/><text x="80" y="35" text-anchor="middle" class="svg-ink" font-size="14">GET</text><rect x="10" y="70" width="140" height="40" rx="10" fill="#fde68a"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="14">POST</text><rect x="10" y="130" width="140" height="40" rx="10" fill="#fed7aa"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="14">PUT</text><rect x="490" y="10" width="140" height="40" rx="10" fill="#ddd6fe"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="14">PATCH</text><rect x="490" y="70" width="140" height="40" rx="10" fill="#fecaca"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="14">DELETE</text><line x1="150" y1="30" x2="250" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="90" x2="250" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="150" x2="250" y2="125" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="30" x2="390" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="90" x2="390" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">padho</text><text x="80" y="122" text-anchor="middle" class="svg-muted" font-size="12">list mein naya banao</text><text x="80" y="182" text-anchor="middle" class="svg-muted" font-size="12">poora replace</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">kuch fields badlo</text><text x="560" y="122" text-anchor="middle" class="svg-muted" font-size="12">hatao</text></svg><p class="cap">Paanch verbs ek resource par kaam karte hain: padhna, banana, replace, badalna aur hatana.</p></div>

<h3>Paanch methods</h3>
<table class="cmp"><tr><th>Method</th><th>Matlab</th><th>CLI jaisa</th><th>Success code</th></tr>
<tr><td><b>GET</b></td><td>Padhna</td><td><code>show</code></td><td>200 OK + data</td></tr>
<tr><td><b>POST</b></td><td>List ya container ke andar naya child banana</td><td>naya loopback add karna</td><td>201 Created</td></tr>
<tr><td><b>PUT</b></td><td>Poora resource replace karna (na ho to bana dena)</td><td>interface ko default karo, phir dobara configure</td><td>201 Created, ya 204 No Content</td></tr>
<tr><td><b>PATCH</b></td><td>Sirf bheje gaye fields badalna; baaki waise hi rehta hai</td><td>ek interface command</td><td>204 No Content</td></tr>
<tr><td><b>DELETE</b></td><td>Hataana</td><td><code>no interface Loopback50</code></td><td>204 No Content</td></tr></table>

<h3>Do shabd jo matter karte hain: safe aur idempotent</h3>
<p>Method <b>safe</b> hai agar woh kuch kabhi nahi badalta. Sirf GET safe hai, isliye GET try karna hamesha theek hai. Method <b>idempotent</b> hai agar wahi request dohrane se system utni hi state mein rehta hai jitna ek baar chalane se. GET, PUT, PATCH (jab woh values set karta hai) aur DELETE idempotent hain. POST nahi hai: do baar bhejne par woh do cheezein banane ki koshish karega. Automation ke liye yeh matter karta hai: agar call timeout ho jaaye to idempotent call bina darr ke dobara bhej sakte ho.</p>

<h3>Asli router par GET aur PATCH</h3>
<p>PATCH baaki ko chhue bina ek value badalta hai. Body ek chhota JSON object hai jiski key module prefix ke saath leaf ka naam hai:</p>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F1/description -u apiuser:Api@2026 -d '{"ietf-interfaces:description": "WAN to Hyderabad"}'
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<p>204 ka matlab "ho gaya, wapas bhejne ko kuch nahi". Wahin mat ruko: GET se confirm karo, phir router par khud.</p>
<pre class="out">AUTO&gt; rest GET .../interface=GigabitEthernet0%2F1/description -u apiuser:Api@2026
HTTP/1.1 200 OK
Content-Type: application/yang-data+json
ETag: "d13smb"

{
<span class="hl">  "ietf-interfaces:description": "WAN to Hyderabad"</span>
}</pre>
<pre class="out">R1# show interfaces description
Interface                      Status         Protocol Description
Gi0/0                          up             up       MGMT-LAN
<span class="hl">Gi0/1                          up             up       WAN to Hyderabad</span>
Gi0/2                          admin down     down     
Gi0/3                          admin down     down     
Lo0                            up             up       </pre>

<h3>PUT, POST aur DELETE: banao, dohrao, hatao</h3>
<p>Bade bodies ke liye JSON ko file mein rakho aur <code>-d @file</code> se bhejo. Yeh <code>lo50.json</code> mein poora naya loopback hai:</p>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "Loopback50",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "50.50.50.50",
          "netmask": "255.255.255.255"
        }
      ]
    }
  }
}</pre>
<pre class="out">AUTO&gt; json validate lo50.json
<span class="hl">lo50.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:interface)</span></pre>
<p>Naye interface ke address par PUT karo. Pehli baar yeh interface <b>banata</b> hai (201 Created, aur <code>Location</code> header jo naya address hai). Doosri baar yeh use ek jaisa data se <b>replace</b> karta hai (204 No Content). Wahi request, dohrana safe:</p>
<pre class="out">AUTO&gt; rest PUT .../interface=Loopback50 -u netops:NK@2026 -d @lo50.json
<span class="hl">HTTP/1.1 201 Created</span>
Location: h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback50</pre>
<pre class="out">AUTO&gt; rest PUT .../interface=Loopback50 -u netops:NK@2026 -d @lo50.json
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<p>POST alag hai. Aap use <b>parent</b> (interfaces container) ko bhejte ho, aur naya naam body ke andar hota hai. Doosra ek jaisa POST fail hota hai kyunki object pehle se hai:</p>
<pre class="out">AUTO&gt; rest POST .../ietf-interfaces:interfaces -u netops:NK@2026 -d @lo51.json
<span class="hl">HTTP/1.1 201 Created</span>
Location: h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces</pre>
<pre class="out">AUTO&gt; rest POST .../ietf-interfaces:interfaces -u netops:NK@2026 -d @lo51.json
<span class="hl">HTTP/1.1 409 Conflict</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "data-exists",
<span class="hl">        "error-message": "interface Loopback51 already exists"</span>
      }
    ]
    ...</pre>
<p>DELETE use hatata hai. Pehli call 204 deti hai. Dobara karne par 404 aata hai kyunki hatane ko kuch bacha nahi. End state wahi hai, yahi idempotent hone ka matlab hai, par status code sach batata hai ki kya hua:</p>
<pre class="out">AUTO&gt; rest DELETE .../interface=Loopback51 -u netops:NK@2026
<span class="hl">HTTP/1.1 204 No Content</span></pre>
<pre class="out">AUTO&gt; rest DELETE .../interface=Loopback51 -u netops:NK@2026
<span class="hl">HTTP/1.1 404 Not Found</span>
Content-Type: application/yang-data+json

{
    ...</pre>

<h3>PUT ya PATCH?</h3>
<p>PATCH ek cheez badalne ka shaleen tareeka hai: jo fields aap nahi batate woh waise hi rehte hain. PUT kehta hai "yeh is resource ke baare mein poora sach hai": body se jo chhoda woh hat jaata hai. Tweak ke liye PATCH, aur resource ko bilkul aapke data par banane ya reset karne ke liye PUT.</p>

<div class="eg"><p><b>Worked example.</b> Change request kehta hai: "WAN description ko WAN to Hyderabad kar do." Aap description leaf par PATCH bhejte ho (204), usi leaf par GET se nayi value padhte ho, aur router par <code>show interfaces description</code>. Teen checks, ek change. Agar aap poore interface par sirf description wali body ke saath PUT karte, to uska IP address mit sakta tha.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Description leaf jaisi single value par POST: woh container nahi hai aur 405 deta hai. (2) Adhoori body ke saath PUT jo resource ka baaki hata deta hai. (3) Maan lena ki 204 ka matlab "verified". (4) Un APIs par POST do baar bhejna jo duplicates allow karti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> POST banata hai, PUT replace karta hai (aur na ho to bana deta hai), PATCH merge karta hai, DELETE hatata hai. GET safe hai; GET, PUT, PATCH aur DELETE idempotent hain; POST nahi. 201 creation ke liye, 204 bina body ke success ke liye.</p></div>

<div class="scn"><h4>Woh PUT jisne address hata diya</h4><p>Ek engineer ko interface disable karna tha aur usne uske address par PUT bheja jiski body mein sirf <code>"enabled": false</code> tha. Reply saaf 204 tha. Ek minute baad monitoring ne dikhaya ki interface ka IP address bhi chala gaya. PUT ne poore interface ko chhoti body se replace kar diya tha. Sahi call <code>enabled</code> leaf par PATCH tha, ya poore object ke saath PUT.</p><p><b>Lesson:</b> Enter dabane se pehle jaano ki aap merge kar rahe ho ya replace.</p></div>

<div class="iv"><p class="q">"PUT aur PATCH mein, aur PUT aur POST mein kya farak hai?"</p><p>PUT ek jaane-pehchane address par poore resource ko replace karta hai aur idempotent hai; PATCH sirf bheje gaye fields merge karta hai. POST parent ke neeche naya child banata hai, naam server ya body tay karti hai, aur use dohrana safe nahi. Verify karne ke liye GET use karo, kyunki 2xx sirf yeh batata hai ki server ne request accept ki.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GET padhta hai, POST banata hai, PUT replace karta hai, PATCH kuch fields badalta hai, DELETE hatata hai.</li>
<li>GET safe hai; GET, PUT, PATCH aur DELETE idempotent hain; POST nahi.</li>
<li>PUT banane par 201 aur replace karne par 204 deta hai; POST 201; DELETE 204.</li>
<li>Duplicate POST 409 Conflict deta hai; missing object ka DELETE 404 deta hai.</li>
<li>Change ko hamesha GET se aur device par verify karo.</li>
</ul></div>

`}};export{e as default};