var e={id:`collaboration`,h:{en:`Collaboration: Webex REST, xAPI, Unified CM (AXL, UDS) and Finesse`,hi:`Collaboration: Webex REST, xAPI, Unified CM (AXL, UDS) aur Finesse`},body:{en:`
<p>Collaboration means people talking: chat, meetings, phones and contact centers. Cisco's APIs here are the most popular ones for beginners, because a bot that posts a message is instantly satisfying. They also show four different API styles in one domain: JSON REST (Webex), a command language on the device (xAPI), SOAP/XML (AXL) and agent-desktop REST (Finesse).</p>

<h3>Webex REST API: spaces, messages, people</h3>
<p><b>Webex</b> is Cisco's cloud collaboration suite. Its REST API is the model REST API: base path <code>/v1</code>, JSON bodies and a <b>Bearer token</b> in the Authorization header. The main objects are <b>people</b>, <b>rooms</b> (the API's name for spaces), <b>memberships</b> (who is in a room) and <b>messages</b>.</p>
<table class="cmp"><tr><th>Job</th><th>Call</th></tr>
<tr><td>Who am I? (test the token)</td><td>GET /v1/people/me</td></tr>
<tr><td>List my spaces</td><td>GET /v1/rooms</td></tr>
<tr><td>Post a message</td><td>POST /v1/messages with roomId and text (or markdown)</td></tr>
<tr><td>Read a message</td><td>GET /v1/messages/{messageId}</td></tr>
<tr><td>Create a webhook</td><td>POST /v1/webhooks</td></tr></table>

<h3>Which token? Personal, bot or integration</h3>
<ul>
<li><b>Personal access token:</b> copied from the developer portal; it represents you and expires after about 12 hours. Good only for testing.</li>
<li><b>Bot access token:</b> you create a <b>bot</b> (a special account for software) and get a token that does not expire unless you regenerate it. A bot posts as itself and sees only the group-space messages in which it is @mentioned (in a direct chat it sees everything). This is the usual choice for ChatOps.</li>
<li><b>Integration (OAuth 2.0):</b> an app acts on behalf of a user who grants permission through a login screen. You receive an access token and a refresh token, both with lifetimes.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - post a message as a bot</span>
import requests
BASE = "h&#116;tps://webex.example/v1"
H = {"Authorization": "Bearer YOUR_BOT_TOKEN", "Content-Type": "application/json"}

rooms = requests.get(BASE + "/rooms", headers=H).json()["items"]
room_id = [r["id"] for r in rooms if r["title"] == "NOC Alerts"][0]

r = requests.post(BASE + "/messages", headers=H,
                  json={"roomId": room_id, "markdown": "**ASW1** is *unreachable*"})
print(r.status_code)                                     <span class="c"># 200</span></pre>
<p>Lists come back inside an <code>items</code> key. Paging uses a <code>Link</code> header, as in Meraki.</p>

<h3>Webhooks: Webex calls you</h3>
<p>For a bot to answer when someone writes, you register a webhook: POST to <code>/v1/webhooks</code> with a name, a <code>targetUrl</code> (your public receiver), a <code>resource</code> (such as <code>messages</code>), an <code>event</code> (such as <code>created</code>), optionally a <code>filter</code> and a <code>secret</code>. When the event happens, Webex POSTs a JSON notice to your receiver. Important detail: <b>the notice contains the message ID, not the message text</b>. Your receiver reads the ID from the <code>data</code> object, then calls GET /v1/messages/{id} to fetch the text, and then answers with POST /v1/messages. If you set a secret, Webex adds a signature header (an HMAC of the body) so that your receiver can reject forged calls.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Webex bot flow">
<rect x="10" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="70" y="46" text-anchor="middle" class="svg-ink" font-size="13">User in space</text>
<rect x="190" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Webex cloud</text>
<rect x="370" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="430" y="46" text-anchor="middle" class="svg-ink" font-size="13">Your bot server</text>
<rect x="540" y="20" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network API</text>
<line x1="130" y1="42" x2="190" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="370" y2="42" stroke="#64748b" stroke-width="2"/><line x1="490" y1="42" x2="540" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. message</text><text x="340" y="90" text-anchor="middle" class="svg-ink" font-size="12">2. webhook (id only)</text><text x="515" y="90" text-anchor="middle" class="svg-ink" font-size="12">4. call</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">3. bot: GET /v1/messages/{id} to read the text</text>
<text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">5. bot: POST /v1/messages to answer</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Widgets and embedded apps put Webex UI inside your own web page or app</text>
</svg><p class="cap">The classic ChatOps loop: webhook, fetch, act, reply.</p></div>
<p><b>Widgets and embedded apps.</b> If you do not want to write a chat client, Webex gives you ready-made <b>widgets</b>: drop-in web components (for example a messaging or meeting widget) you embed in your own web page, authenticated with a token. <b>Embedded apps</b> do the reverse: your web app opens inside Webex. Know the idea: reuse Cisco's UI instead of rebuilding it.</p>

<h3>Webex Devices and xAPI</h3>
<p>Room devices (Board, Desk, Room series) expose <b>xAPI</b>, a command layer that lives on the device itself. It has four word types:</p>
<ul>
<li><code>xCommand</code>: do something (<code>xCommand Dial Number: person@example.com</code>).</li>
<li><code>xStatus</code>: read live state (<code>xStatus Audio Volume</code>).</li>
<li><code>xConfiguration</code>: read or set a setting (<code>xConfiguration Audio DefaultVolume: 50</code>).</li>
<li><code>xEvent</code>: be notified when something happens (a call connected, a button pressed).</li>
</ul>
<p>You reach xAPI over SSH or serial, with HTTP (a request to the device's web interface), over a websocket (for events) and through a cloud API for managed devices. Devices can also run <b>macros</b>, small JavaScript programs that use the same commands, for example turning off a display when the room empties.</p>

<h3>Unified CM: AXL and UDS</h3>
<p><b>Cisco Unified Communications Manager (Unified CM, CUCM)</b> is the call-control system for IP phones. Two APIs are worth knowing:</p>
<ul>
<li><b>AXL (Administrative XML Web Service):</b> a <b>SOAP</b> API over HTTPS, normally on port 8443 at the path <code>/axl/</code>, with basic authentication. It is the full administration API: add, get, update and remove phones, users, lines, partitions and more (operations named like <code>addPhone</code>, <code>getPhone</code>, <code>updatePhone</code>, <code>listPhone</code>), plus direct SQL queries. The AXL service must be activated and the account needs an AXL role. In Python the <code>zeep</code> library loads the WSDL and makes SOAP calls feel like functions.</li>
<li><b>UDS (User Data Services):</b> a small <b>REST</b> API for end users and apps: look up users and their devices and change a few self-care settings. It is not for full administration.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - shape of a SOAP request to AXL</span>
POST /axl/ HTTP/1.1
SOAPAction: "CUCM:DB ver=14.0 getPhone"
Content-Type: text/xml

&lt;soapenv:Envelope&gt;
  &lt;soapenv:Body&gt;
    &lt;ns:getPhone&gt;&lt;name&gt;SEP001122334455&lt;/name&gt;&lt;/ns:getPhone&gt;
  &lt;/soapenv:Body&gt;
&lt;/soapenv:Envelope&gt;</pre>

<h3>Finesse: the contact-center agent desktop</h3>
<p><b>Cisco Finesse</b> is the browser agent desktop of the Unified Contact Center products. It has a REST API (resources such as users and dialogs) with notifications pushed to clients, so a custom desktop or a CRM can show an agent's state and calls. Its extension model is the <b>gadget</b>: a small web component (HTML and JavaScript) placed on the agent screen, for example to show customer details when a call arrives. Agents move between states such as <i>Not Ready</i>, <i>Ready</i> and <i>Talking</i>, and the API lets software read or change that state.</p>

<div class="warn"><p><b>Common mistakes.</b> Expecting the webhook to carry the message text (it carries only the ID). Using a personal token for a production bot (it expires in hours). Sending JSON to AXL (it is SOAP/XML). Forgetting that a bot in a group space sees only messages that mention it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match style to product: Webex = REST/JSON with Bearer token and webhooks; AXL = SOAP/XML; UDS = REST; xAPI = xCommand, xStatus, xConfiguration, xEvent on the device; Finesse = agent-desktop REST plus gadgets.</p></div>

<div class="scn"><h4>The "ask the network" bot</h4><p>A bank's NOC built a Webex bot. Engineers wrote "@NetBot status core" in the NOC space. The webhook delivered the message ID to a small server; the server fetched the text, parsed the word "core", called the Catalyst Center API for that group of devices and replied with a three-line summary and a link. The first version replied to its own messages in an endless loop. The fix was to ignore messages whose sender email was the bot's own.</p><p><b>Lesson:</b> ChatOps = webhook, fetch the text, act through another API, reply, and never answer yourself.</p></div>

<div class="iv"><p class="q">"How would you build a Webex bot that reacts when someone mentions it?"</p><p>Create a bot to get a token, add it to a space, register a webhook for messages created with the bot as a filter, receive the JSON notice, GET the message by ID to read the text, act, and POST a reply to the room. Mention that the notice has only IDs, that the secret signature should be verified, and that the receiver must be reachable over HTTPS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Webex REST: Bearer token, objects people, rooms, memberships, messages; lists in items.</li>
<li>Bots get long-lived tokens; personal tokens expire in about 12 hours; integrations use OAuth 2.0.</li>
<li>Webhooks deliver IDs, so you fetch the message to read the text.</li>
<li>xAPI on devices: xCommand, xStatus, xConfiguration, xEvent; macros run JavaScript on the device.</li>
<li>Unified CM: AXL is SOAP/XML for admin, UDS is light REST for users. Finesse uses REST plus gadgets.</li>
</ul></div>
`,hi:`
<p>Collaboration ka matlab hai log baat karte hue: chat, meetings, phones aur contact centers. Yahan ki Cisco APIs beginners mein sabse popular hain, kyunki message post karne wala bot turant maza deta hai. Yeh ek hi domain mein chaar alag API styles bhi dikhati hain: JSON REST (Webex), device par command language (xAPI), SOAP/XML (AXL) aur agent-desktop REST (Finesse).</p>

<h3>Webex REST API: spaces, messages, people</h3>
<p><b>Webex</b> Cisco ka cloud collaboration suite hai. Iski REST API model REST API hai: base path <code>/v1</code>, JSON bodies aur Authorization header mein <b>Bearer token</b>. Main objects hain <b>people</b>, <b>rooms</b> (API mein spaces ka naam), <b>memberships</b> (room mein kaun hai) aur <b>messages</b>.</p>
<table class="cmp"><tr><th>Kaam</th><th>Call</th></tr>
<tr><td>Main kaun hoon? (token test)</td><td>GET /v1/people/me</td></tr>
<tr><td>Mere spaces ki list</td><td>GET /v1/rooms</td></tr>
<tr><td>Message post karo</td><td>POST /v1/messages, roomId aur text (ya markdown) ke saath</td></tr>
<tr><td>Message padho</td><td>GET /v1/messages/{messageId}</td></tr>
<tr><td>Webhook banao</td><td>POST /v1/webhooks</td></tr></table>

<h3>Kaunsa token? Personal, bot ya integration</h3>
<ul>
<li><b>Personal access token:</b> developer portal se copy hota hai; yeh aapko represent karta hai aur lagbhag 12 ghante mein expire hota hai. Sirf testing ke liye achha hai.</li>
<li><b>Bot access token:</b> aap ek <b>bot</b> banate ho (software ke liye special account) aur ek token milta hai jo tab tak expire nahi hota jab tak aap regenerate na karo. Bot apne naam se post karta hai aur group spaces mein sirf wahi messages dekhta hai jinmein use @mention kiya gaya ho (direct chat mein sab dekhta hai). ChatOps ke liye yahi aam choice hai.</li>
<li><b>Integration (OAuth 2.0):</b> ek app us user ki taraf se kaam karti hai jo login screen se permission deta hai. Aapko ek access token aur ek refresh token milta hai, dono ki lifetime hoti hai.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - bot ki tarah message post karo</span>
import requests
BASE = "h&#116;tps://webex.example/v1"
H = {"Authorization": "Bearer YOUR_BOT_TOKEN", "Content-Type": "application/json"}

rooms = requests.get(BASE + "/rooms", headers=H).json()["items"]
room_id = [r["id"] for r in rooms if r["title"] == "NOC Alerts"][0]

r = requests.post(BASE + "/messages", headers=H,
                  json={"roomId": room_id, "markdown": "**ASW1** is *unreachable*"})
print(r.status_code)                                     <span class="c"># 200</span></pre>
<p>Lists <code>items</code> key ke andar aati hain. Paging Meraki ki tarah <code>Link</code> header se hoti hai.</p>

<h3>Webhooks: Webex aapko call karta hai</h3>
<p>Bot tab jawab de jab koi likhe, iske liye webhook register karte ho: <code>/v1/webhooks</code> par POST, jismein ek name, ek <code>targetUrl</code> (aapka public receiver), ek <code>resource</code> (jaise <code>messages</code>), ek <code>event</code> (jaise <code>created</code>), chaho to ek <code>filter</code> aur ek <code>secret</code> hota hai. Event hone par Webex aapke receiver ko JSON notice POST karta hai. Zaroori detail: <b>notice mein message ID hota hai, message ka text nahi</b>. Aapka receiver <code>data</code> object se ID padhta hai, phir text ke liye GET /v1/messages/{id} call karta hai, aur phir POST /v1/messages se jawab deta hai. Agar secret set kiya ho to Webex ek signature header (body ka HMAC) jodta hai taaki receiver jaali calls reject kar sake.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Webex bot flow">
<rect x="10" y="20" width="120" height="44" rx="8" fill="#fde68a"/><text x="70" y="46" text-anchor="middle" class="svg-ink" font-size="13">Space mein user</text>
<rect x="190" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Webex cloud</text>
<rect x="370" y="20" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="430" y="46" text-anchor="middle" class="svg-ink" font-size="13">Aapka bot server</text>
<rect x="540" y="20" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="585" y="46" text-anchor="middle" class="svg-ink" font-size="13">Network API</text>
<line x1="130" y1="42" x2="190" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="370" y2="42" stroke="#64748b" stroke-width="2"/><line x1="490" y1="42" x2="540" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="12">1. message</text><text x="340" y="90" text-anchor="middle" class="svg-ink" font-size="12">2. webhook (sirf id)</text><text x="515" y="90" text-anchor="middle" class="svg-ink" font-size="12">4. call</text>
<text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">3. bot: text padhne ke liye GET /v1/messages/{id}</text>
<text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="12">5. bot: jawab dene ke liye POST /v1/messages</text>
<text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Widgets aur embedded apps Webex UI ko aapke web page ya app ke andar laate hain</text>
</svg><p class="cap">Classic ChatOps loop: webhook, fetch, action, reply.</p></div>
<p><b>Widgets aur embedded apps.</b> Agar chat client nahi likhna, to Webex ready-made <b>widgets</b> deta hai: drop-in web components (jaise messaging ya meeting widget) jo aap apne web page mein embed karte ho, token se authenticated. <b>Embedded apps</b> ulta karte hain: aapki web app Webex ke andar khulti hai. Idea yaad rakho: UI dobara banane ki jagah Cisco ka UI reuse karo.</p>

<h3>Webex Devices aur xAPI</h3>
<p>Room devices (Board, Desk, Room series) <b>xAPI</b> expose karte hain, ek command layer jo device par hi hoti hai. Ismein chaar tarah ke words hote hain:</p>
<ul>
<li><code>xCommand</code>: kuch karo (<code>xCommand Dial Number: person@example.com</code>).</li>
<li><code>xStatus</code>: live state padho (<code>xStatus Audio Volume</code>).</li>
<li><code>xConfiguration</code>: setting padho ya set karo (<code>xConfiguration Audio DefaultVolume: 50</code>).</li>
<li><code>xEvent</code>: kuch hone par notification lo (call connect hui, button dabaya gaya).</li>
</ul>
<p>xAPI tak aap SSH ya serial se, HTTP se (device ke web interface ko request), websocket se (events ke liye) aur managed devices ke liye cloud API se pahunch sakte ho. Devices <b>macros</b> bhi chala sakte hain, yaani chhote JavaScript programs jo wahi commands use karte hain, jaise room khali hone par display band karna.</p>

<h3>Unified CM: AXL aur UDS</h3>
<p><b>Cisco Unified Communications Manager (Unified CM, CUCM)</b> IP phones ka call-control system hai. Do APIs jaanne layak hain:</p>
<ul>
<li><b>AXL (Administrative XML Web Service):</b> HTTPS par <b>SOAP</b> API, aam taur par port 8443 par path <code>/axl/</code> par, basic authentication ke saath. Yeh poori administration API hai: phones, users, lines, partitions aur aur bhi add, get, update aur remove karo (operations jinke naam <code>addPhone</code>, <code>getPhone</code>, <code>updatePhone</code>, <code>listPhone</code> jaise hain), plus seedhe SQL queries. AXL service activate honi chahiye aur account ko AXL role chahiye. Python mein <code>zeep</code> library WSDL load karti hai aur SOAP calls functions jaisi lagti hain.</li>
<li><b>UDS (User Data Services):</b> end users aur apps ke liye chhoti <b>REST</b> API: users aur unke devices dekho aur kuch self-care settings badlo. Yeh poori administration ke liye nahi hai.</li>
</ul>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - AXL ko SOAP request ki shakal</span>
POST /axl/ HTTP/1.1
SOAPAction: "CUCM:DB ver=14.0 getPhone"
Content-Type: text/xml

&lt;soapenv:Envelope&gt;
  &lt;soapenv:Body&gt;
    &lt;ns:getPhone&gt;&lt;name&gt;SEP001122334455&lt;/name&gt;&lt;/ns:getPhone&gt;
  &lt;/soapenv:Body&gt;
&lt;/soapenv:Envelope&gt;</pre>

<h3>Finesse: contact-center agent desktop</h3>
<p><b>Cisco Finesse</b> Unified Contact Center products ka browser agent desktop hai. Iski ek REST API hai (users aur dialogs jaise resources) aur clients ko push hone wali notifications, taaki custom desktop ya CRM agent ki state aur calls dikha sake. Iska extension model <b>gadget</b> hai: agent screen par lagi chhoti web component (HTML aur JavaScript), jaise call aane par customer details dikhana. Agents <i>Not Ready</i>, <i>Ready</i> aur <i>Talking</i> jaisi states mein jaate hain, aur API software ko woh state padhne ya badalne deti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Webhook se message text ki ummeed karna (usmein sirf ID hoti hai). Production bot ke liye personal token use karna (woh ghanton mein expire hota hai). AXL ko JSON bhejna (woh SOAP/XML hai). Yeh bhool jana ki group space mein bot sirf wahi messages dekhta hai jo use mention karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Style ko product se match karo: Webex = Bearer token aur webhooks wali REST/JSON; AXL = SOAP/XML; UDS = REST; xAPI = device par xCommand, xStatus, xConfiguration, xEvent; Finesse = agent-desktop REST plus gadgets.</p></div>

<div class="scn"><h4>"Network se poocho" bot</h4><p>Ek bank ke NOC ne Webex bot banaya. Engineers NOC space mein "@NetBot status core" likhte the. Webhook ne message ID ek chhote server tak pahunchayi; server ne text fetch kiya, "core" shabd parse kiya, us group ke devices ke liye Catalyst Center API call ki aur teen line ka summary aur ek link ke saath jawab diya. Pehla version apne hi messages ka jawab dene lagta tha, ek anant loop mein. Fix tha un messages ko ignore karna jinka sender email bot ka apna ho.</p><p><b>Lesson:</b> ChatOps = webhook, text fetch, doosri API se action, reply, aur khud ko kabhi jawab mat do.</p></div>

<div class="iv"><p class="q">"Aisa Webex bot kaise banaoge jo mention hone par react kare?"</p><p>Token ke liye bot banao, use space mein jodo, bot ko filter banakar messages created ke liye webhook register karo, JSON notice receive karo, text padhne ke liye ID se message GET karo, action lo, aur room mein reply POST karo. Yeh batao ki notice mein sirf IDs hoti hain, secret signature verify karna chahiye, aur receiver HTTPS par reachable hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Webex REST: Bearer token, objects people, rooms, memberships, messages; lists items mein.</li>
<li>Bots ko lambe-chalne wale tokens milte hain; personal tokens lagbhag 12 ghante mein expire; integrations OAuth 2.0 use karte hain.</li>
<li>Webhooks IDs deliver karte hain, isliye text padhne ke liye message fetch karna padta hai.</li>
<li>Devices par xAPI: xCommand, xStatus, xConfiguration, xEvent; macros device par JavaScript chalate hain.</li>
<li>Unified CM: AXL admin ke liye SOAP/XML hai, UDS users ke liye halki REST. Finesse REST plus gadgets use karta hai.</li>
</ul></div>
`}};export{e as default};