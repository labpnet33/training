var e={id:`restconf`,h:{en:`Hands-on: read and change R1 with a REST API`,hi:`Hands-on: REST API se R1 padho aur badlo`},body:{en:`
<p>Before you can check your balance in a bank's mobile app, the bank must switch on online banking for your account and give you a login. After that you can read your balance (a read) and transfer money (a change) without ever visiting the branch. A router is the same: first you switch on its API and create an API user, then you can read and change it from your desk. This chapter walks through Lab 1 step by step.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab 1 topology">
<rect x="20" y="55" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="14">NMS</text>
<rect x="190" y="55" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="350" y="55" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="520" y="55" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="14">ISP</text>
<line x1="130" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="80" x2="350" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.50</text>
<text x="360" y="130" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 10.20.0.1</text>
<text x="490" y="45" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 198.51.100.2/30</text>
<text x="570" y="130" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 starts shut down, description TO-OLD-ISP</text>
</svg><p class="cap">NMS talks HTTPS to R1's RESTCONF API. The WAN link to ISP is down until you enable it through the API.</p></div>

<h3>Step 1: turn on the API on R1</h3>
<p><b>RESTCONF</b> is a standard REST-style API on network devices. On Cisco IOS XE it runs over HTTPS and uses YANG data models. Four global commands turn it on:</p>
<pre class="code">R1# configure terminal
<span class="c">! API user; privilege 15 is needed to change configuration</span>
R1(config)# username netadmin privilege 15 secret Rest@123
<span class="c">! start the HTTPS server (TCP 443)</span>
R1(config)# ip h&#116;tp secure-server
<span class="c">! check web logins against the local user database</span>
R1(config)# ip h&#116;tp authentication local
<span class="c">! start the RESTCONF service itself</span>
R1(config)# restconf
R1(config)# end</pre>
<p>Without <code>ip h&#116;tp authentication local</code>, the web server checks the <b>enable password</b> instead of your user, and every request fails with 401.</p>
<pre class="out">R1# show running-config | include restconf|secure-server|authentication local
<span class="hl">ip h&#116;tp authentication local
ip h&#116;tp secure-server
restconf</span></pre>

<h3>Step 2: read the interfaces (GET)</h3>
<p>RESTCONF URIs follow the YANG model: <code>/restconf/data/</code>, then the <b>module:container</b>, then list entries and leaves. From NMS (remember to type the HTTPS scheme in front of the address):</p>
<pre class="code">NMS&gt; rest GET 10.20.0.1/restconf/data/ietf-interfaces:interfaces -u netadmin:Rest@123</pre>
<pre class="out">HTTP/1.1 200 OK
Server: nginx
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
        "name": "GigabitEthernet0/0",
        "description": "LAN-USERS",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
        "ietf-ip:ipv4": { "address": [ { "ip": "10.20.0.1", "netmask": "255.255.255.0" } ] }
      },
      {
        "name": "GigabitEthernet0/1",
<span class="hl">        "description": "TO-OLD-ISP",</span>
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": false,
        "ietf-ip:ipv4": { "address": [ { "ip": "198.51.100.2", "netmask": "255.255.255.252" } ] }
      }
    ]
  }
}</pre>
<p>The <code>interface</code> key holds a <b>list</b> (square brackets). Find the object whose <code>name</code> is GigabitEthernet0/1 and read its <code>description</code>: <b>TO-OLD-ISP</b>. Notice <code>"enabled": false</code>: that is <code>shutdown</code> in CLI language.</p>

<h3>Step 3: change one leaf (PATCH)</h3>
<p>To address one interface, add the list key: <code>interface=GigabitEthernet0%2F1</code>. The <code>/</code> inside the name must be percent-encoded as <b>%2F</b>, otherwise the server reads it as a new path level. Add <code>/description</code> to target just that leaf. The file <code>desc.json</code> has a trailing comma; after removing it (next chapters explain every JSON rule) you send it:</p>
<pre class="code">NMS&gt; json validate desc.json
NMS&gt; sed -i '2s/,$//' desc.json
NMS&gt; rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netadmin:Rest@123 -d @desc.json</pre>
<pre class="out"><span class="hl">HTTP/1.1 204 No Content</span>
Server: nginx</pre>
<p><b>204 No Content</b> means "done, and I have nothing to send back". The option <code>-d @desc.json</code> sends the file as the request body.</p>

<h3>Step 4: a valid file that is still rejected</h3>
<p><code>enable.json</code> passes <code>json validate</code>, but R1 answers 400:</p>
<pre class="out">HTTP/1.1 400 Bad Request
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "invalid value \\"true\\" for leaf enabled (expected true or false without quotes)"</span>
      }
    ]
  }
}</pre>
<p>The YANG model says <code>enabled</code> is a <b>boolean</b>. <code>"true"</code> in quotes is a <b>string</b>. Remove the quotes and PATCH the file to the list entry itself:</p>
<pre class="code">NMS&gt; json types enable.json
NMS&gt; sed -i 's/"true"/true/' enable.json
NMS&gt; rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netadmin:Rest@123 -d @enable.json</pre>
<p>The answer is 204 again, the WAN link comes up and R1 can ping ISP at 198.51.100.1. PATCH merged only <code>enabled</code>; the IP address and new description stayed. A PUT with the same small body could have replaced the whole interface entry.</p>

<h3>Step 5: verify from both sides</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.20.0.1       YES manual up                    up
<span class="hl">GigabitEthernet0/1     198.51.100.2    YES manual up                    up</span></pre>
<p>A new GET of the interface from NMS shows <code>"description": "WAN link to Branch-A"</code> and <code>"enabled": true</code>. The API change and the CLI view are the same configuration seen two ways.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing <code>interface=GigabitEthernet0/1</code> without %2F (400 or 404); forgetting <code>ip h&#116;tp authentication local</code> (401); a user below privilege 15 (403 on writes); sending a PATCH to the wrong level, for example a body with <code>ietf-interfaces:interface</code> to the <code>/description</code> URI.</p></div>

<div class="exam"><p><b>Exam trap.</b> RESTCONF runs over <b>HTTPS</b> and encodes data as JSON or XML; <b>NETCONF</b> runs over <b>SSH on TCP 830</b> and uses XML. Both use YANG models. A successful PATCH or DELETE often returns 204, not 200.</p></div>

<div class="scn"><h4>Eighty WAN descriptions in one evening</h4><p>A service provider audit asked every branch router's WAN interface to carry the circuit ID in its description. There were 80 routers. An engineer read each router's interfaces with one GET, took the circuit IDs from the provider's spreadsheet, and sent one PATCH per router to the <code>/description</code> leaf. Three routers returned 401: they were missing <code>ip h&#116;tp authentication local</code>. Two returned 404: their WAN port was GigabitEthernet0/0/1, not 0/1. After fixing those, a final GET loop confirmed all 80.</p><p><b>Lesson:</b> read the status code for every device; it tells you exactly which ones need attention and why.</p></div>

<div class="iv"><p class="q">"Walk me through changing an interface description on an IOS XE router using RESTCONF."</p><p>Strong answer: enable it with a privilege 15 user, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code> and <code>restconf</code>. GET <code>/restconf/data/ietf-interfaces:interfaces</code> to see the data. Send PATCH to <code>interface=GigabitEthernet0%2F1/description</code> with a JSON body such as <code>{"ietf-interfaces:description": "WAN link"}</code>, expect 204, then verify with GET and the CLI. Mention %2F encoding and PATCH versus PUT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enable RESTCONF: privilege 15 user, HTTPS server, local authentication, <code>restconf</code>.</li>
<li>URI pattern: <code>/restconf/data/module:container/list=key/leaf</code>; encode <code>/</code> in keys as %2F.</li>
<li>GET returns 200 with JSON; a successful PATCH returns 204 No Content.</li>
<li>Valid JSON can still be rejected (400) when a value has the wrong data type for the YANG model.</li>
<li>Always verify the change both through the API and on the device CLI.</li>
</ul></div>
`,hi:`
<p>Bank ke mobile app mein balance check karne se pehle bank ko aapke account ke liye online banking on karni padti hai aur aapko ek login dena padta hai. Uske baad aap branch gaye bina balance padh sakte ho (read) aur paise transfer kar sakte ho (change). Router bhi aisa hi hai: pehle aap uski API on karte ho aur ek API user banate ho, phir apni desk se use padh aur badal sakte ho. Yeh chapter Lab 1 ko step by step chalata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab 1 topology">
<rect x="20" y="55" width="110" height="50" rx="8" fill="#bae6fd"/><text x="75" y="85" text-anchor="middle" class="svg-ink" font-size="14">NMS</text>
<rect x="190" y="55" width="100" height="50" rx="8" fill="#e2e8f0"/><text x="240" y="85" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="350" y="55" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="405" y="85" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="520" y="55" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="85" text-anchor="middle" class="svg-ink" font-size="14">ISP</text>
<line x1="130" y1="80" x2="190" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="80" x2="350" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="460" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="75" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.50</text>
<text x="360" y="130" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0 10.20.0.1</text>
<text x="490" y="45" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1 198.51.100.2/30</text>
<text x="570" y="130" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 shut down se shuru, description TO-OLD-ISP</text>
</svg><p class="cap">NMS R1 ki RESTCONF API se HTTPS par baat karta hai. ISP wala WAN link tab tak down hai jab tak aap use API se enable na karo.</p></div>

<h3>Step 1: R1 par API on karo</h3>
<p><b>RESTCONF</b> network devices par ek standard REST-style API hai. Cisco IOS XE par yeh HTTPS par chalti hai aur YANG data models use karti hai. Chaar global commands ise on karte hain:</p>
<pre class="code">R1# configure terminal
<span class="c">! API user; configuration badalne ke liye privilege 15 chahiye</span>
R1(config)# username netadmin privilege 15 secret Rest@123
<span class="c">! HTTPS server start karo (TCP 443)</span>
R1(config)# ip h&#116;tp secure-server
<span class="c">! web logins ko local user database se check karo</span>
R1(config)# ip h&#116;tp authentication local
<span class="c">! RESTCONF service khud start karo</span>
R1(config)# restconf
R1(config)# end</pre>
<p><code>ip h&#116;tp authentication local</code> ke bina web server aapke user ki jagah <b>enable password</b> check karta hai, aur har request 401 ke saath fail hoti hai.</p>
<pre class="out">R1# show running-config | include restconf|secure-server|authentication local
<span class="hl">ip h&#116;tp authentication local
ip h&#116;tp secure-server
restconf</span></pre>

<h3>Step 2: interfaces padho (GET)</h3>
<p>RESTCONF URIs YANG model ko follow karte hain: <code>/restconf/data/</code>, phir <b>module:container</b>, phir list entries aur leaves. NMS se (address ke aage HTTPS scheme type karna yaad rakho):</p>
<pre class="code">NMS&gt; rest GET 10.20.0.1/restconf/data/ietf-interfaces:interfaces -u netadmin:Rest@123</pre>
<pre class="out">HTTP/1.1 200 OK
Server: nginx
Content-Type: application/yang-data+json

{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
        "name": "GigabitEthernet0/0",
        "description": "LAN-USERS",
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": true,
        "ietf-ip:ipv4": { "address": [ { "ip": "10.20.0.1", "netmask": "255.255.255.0" } ] }
      },
      {
        "name": "GigabitEthernet0/1",
<span class="hl">        "description": "TO-OLD-ISP",</span>
        "type": "iana-if-type:ethernetCsmacd",
        "enabled": false,
        "ietf-ip:ipv4": { "address": [ { "ip": "198.51.100.2", "netmask": "255.255.255.252" } ] }
      }
    ]
  }
}</pre>
<p><code>interface</code> key ek <b>list</b> rakhti hai (square brackets). Woh object dhoondo jiska <code>name</code> GigabitEthernet0/1 hai aur uska <code>description</code> padho: <b>TO-OLD-ISP</b>. <code>"enabled": false</code> par dhyaan do: CLI ki bhasha mein yeh <code>shutdown</code> hai.</p>

<h3>Step 3: ek leaf badlo (PATCH)</h3>
<p>Ek interface ko address karne ke liye list key jodo: <code>interface=GigabitEthernet0%2F1</code>. Naam ke andar ka <code>/</code> <b>%2F</b> ki tarah percent-encode hona chahiye, warna server use naya path level samajhta hai. Sirf us leaf ko target karne ke liye <code>/description</code> jodo. File <code>desc.json</code> mein trailing comma hai; use hatane ke baad (agle chapters JSON ka har rule samjhate hain) aap use bhejte ho:</p>
<pre class="code">NMS&gt; json validate desc.json
NMS&gt; sed -i '2s/,$//' desc.json
NMS&gt; rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1/description -u netadmin:Rest@123 -d @desc.json</pre>
<pre class="out"><span class="hl">HTTP/1.1 204 No Content</span>
Server: nginx</pre>
<p><b>204 No Content</b> ka matlab hai "ho gaya, aur mere paas wapas bhejne ko kuch nahi". Option <code>-d @desc.json</code> file ko request body ki tarah bhejta hai.</p>

<h3>Step 4: valid file jo phir bhi reject hoti hai</h3>
<p><code>enable.json</code> <code>json validate</code> pass kar leti hai, par R1 400 deta hai:</p>
<pre class="out">HTTP/1.1 400 Bad Request
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
<span class="hl">        "error-message": "invalid value \\"true\\" for leaf enabled (expected true or false without quotes)"</span>
      }
    ]
  }
}</pre>
<p>YANG model kehta hai <code>enabled</code> ek <b>boolean</b> hai. Quotes wala <code>"true"</code> ek <b>string</b> hai. Quotes hatao aur file ko seedha list entry par PATCH karo:</p>
<pre class="code">NMS&gt; json types enable.json
NMS&gt; sed -i 's/"true"/true/' enable.json
NMS&gt; rest PATCH 10.20.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F1 -u netadmin:Rest@123 -d @enable.json</pre>
<p>Jawab phir se 204 hai, WAN link up ho jaata hai aur R1 ISP ko 198.51.100.1 par ping kar sakta hai. PATCH ne sirf <code>enabled</code> merge kiya; IP address aur naya description wahi rahe. Same chhoti body wala PUT poori interface entry replace kar sakta tha.</p>

<h3>Step 5: dono taraf se verify karo</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.20.0.1       YES manual up                    up
<span class="hl">GigabitEthernet0/1     198.51.100.2    YES manual up                    up</span></pre>
<p>NMS se interface ka naya GET <code>"description": "WAN link to Branch-A"</code> aur <code>"enabled": true</code> dikhata hai. API change aur CLI view ek hi configuration ko do tareekon se dekhna hai.</p>

<div class="warn"><p><b>Common galtiyaan.</b> %2F ke bina <code>interface=GigabitEthernet0/1</code> likhna (400 ya 404); <code>ip h&#116;tp authentication local</code> bhoolna (401); privilege 15 se neeche ka user (writes par 403); PATCH galat level par bhejna, jaise <code>ietf-interfaces:interface</code> wali body <code>/description</code> URI par.</p></div>

<div class="exam"><p><b>Exam trap.</b> RESTCONF <b>HTTPS</b> par chalta hai aur data JSON ya XML mein encode karta hai; <b>NETCONF</b> <b>SSH par TCP 830</b> par chalta hai aur XML use karta hai. Dono YANG models use karte hain. Successful PATCH ya DELETE aksar 200 nahi, 204 lautata hai.</p></div>

<div class="scn"><h4>Ek shaam mein assi WAN descriptions</h4><p>Ek service provider audit ne kaha ki har branch router ke WAN interface ke description mein circuit ID ho. 80 routers the. Ek engineer ne har router ke interfaces ek GET se padhe, provider ki spreadsheet se circuit IDs liye, aur har router ko <code>/description</code> leaf par ek PATCH bheja. Teen routers ne 401 diya: unmein <code>ip h&#116;tp authentication local</code> missing tha. Do ne 404 diya: unka WAN port GigabitEthernet0/0/1 tha, 0/1 nahi. Unhe theek karne ke baad ek aakhri GET loop ne saare 80 confirm kiye.</p><p><b>Seekh:</b> har device ka status code padho; woh exactly batata hai kin par dhyaan dena hai aur kyun.</p></div>

<div class="iv"><p class="q">"IOS XE router par RESTCONF se interface description badalne ka process batao."</p><p>Strong answer: privilege 15 user, <code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code> aur <code>restconf</code> se enable karo. Data dekhne ke liye <code>/restconf/data/ietf-interfaces:interfaces</code> GET karo. <code>interface=GigabitEthernet0%2F1/description</code> par <code>{"ietf-interfaces:description": "WAN link"}</code> jaisi JSON body ke saath PATCH bhejo, 204 expect karo, phir GET aur CLI se verify karo. %2F encoding aur PATCH vs PUT zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RESTCONF enable: privilege 15 user, HTTPS server, local authentication, <code>restconf</code>.</li>
<li>URI pattern: <code>/restconf/data/module:container/list=key/leaf</code>; keys mein <code>/</code> ko %2F encode karo.</li>
<li>GET JSON ke saath 200 deta hai; successful PATCH 204 No Content deta hai.</li>
<li>Valid JSON bhi reject (400) ho sakti hai jab value ka data type YANG model ke hisaab se galat ho.</li>
<li>Change ko hamesha API aur device CLI dono se verify karo.</li>
</ul></div>
`}};export{e as default};