var e={id:`headers-auth`,h:{en:`Headers and login: who are you, what format?`,hi:`Headers aur login: aap kaun, kaunsa format?`},body:{en:`

<p>An API message has two parts: <b>headers</b> and a <b>body</b>. Headers are short labels, one per line, in the form <code>Name: value</code>. They tell the other side who you are, what you can read and what you are sending. Think of headers as the writing on an envelope and the body as the letter inside.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Headers travel both ways, before the body."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="150" height="80" rx="10" fill="#bae6fd"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">Python / rest</text><rect x="480" y="50" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="555" y="87" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="555" y="105" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF</text><line x1="160" y1="75" x2="480" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="480" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">Authorization  Accept  Content-Type</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Content-Type  ETag  WWW-Authenticate</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="13">Headers = labels on the envelope; body = the letter</text></svg><p class="cap">Headers travel both ways, before the body.</p></div>

<h3>The four headers that matter</h3>
<table class="cmp"><tr><th>Header</th><th>Who sets it</th><th>What it says</th></tr>
<tr><td><code>Authorization</code></td><td>Client</td><td>Who I am (credentials)</td></tr>
<tr><td><code>Accept</code></td><td>Client</td><td>Which format I want back (JSON or XML)</td></tr>
<tr><td><code>Content-Type</code></td><td>Whoever sends a body</td><td>Which format the body is in</td></tr>
<tr><td><code>WWW-Authenticate</code></td><td>Server, on a 401</td><td>How to log in (for example Basic)</td></tr></table>

<h3>Basic authentication, line by line</h3>
<p>RESTCONF on a router usually uses <b>HTTP Basic authentication</b>. The client joins <code>username:password</code>, converts it to base64 and puts it in the <code>Authorization</code> header. The <code>-v</code> (verbose) option shows what the client really sent. Lines starting with <code>&gt;</code> are what we send; the rest is the reply:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback0/description -u apiuser:Api@2026 -v
* Connected to 10.99.0.1 port 443
* TLSv1.2 handshake done, server certificate is self-signed (accepted)
&gt; GET /restconf/data/ietf-interfaces:interfaces/interface=Loopback0/description HTTP/1.1
&gt; Host: 10.99.0.1
<span class="hl">&gt; Authorization: Basic YXBpdXNlcjpBcGlAMjAyNg==</span>
&gt;
HTTP/1.1 404 Not Found
Content-Type: application/yang-data+json

    ...</pre>
<p>The strange text <code>YXBpdXNlcjpBcGlAMjAyNg==</code> is just <code>apiuser:Api@2026</code> written in base64. Base64 is an <b>encoding, not encryption</b>: anyone who sees it can turn it back in one step. That is why Basic authentication must only travel inside HTTPS, where the whole conversation is encrypted. Note the line about the certificate: the lab router has a <i>self-signed</i> certificate, and the lab client accepts it. In real life you install a certificate your client trusts and keep verification <b>on</b>. Turning verification off is for a throw-away lab only.</p>

<h3>Accept: choose JSON or XML</h3>
<p>RESTCONF can answer in JSON or XML. You ask with <code>Accept</code>. The server confirms its choice with <code>Content-Type</code> in the reply. The same Loopback0, shown as XML:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback0 -u apiuser:Api@2026 -H 'Accept: application/yang-data+xml'
HTTP/1.1 200 OK
<span class="hl">Content-Type: application/yang-data+xml</span>
ETag: "1qqq4pp"

&lt;interface xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
  &lt;name&gt;Loopback0&lt;/name&gt;
  &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:softwareLoopback&lt;/type&gt;
  &lt;enabled&gt;true&lt;/enabled&gt;
  &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
    &lt;address&gt;
      &lt;ip&gt;1.1.1.1&lt;/ip&gt;
    ...</pre>
<p>Automation scripts almost always prefer JSON, because Python turns JSON into a dictionary with one line. The JSON media type is <code>application/yang-data+json</code>.</p>

<h3>Content-Type: tell the truth about your body</h3>
<p>When you send a body, <code>Content-Type</code> must match what is inside. If it does not, or the server does not support that format, you get 415. Here the lab router accepts JSON bodies only, and we deliberately announce XML:</p>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json
<span class="hl">HTTP/1.1 415 Unsupported Media Type</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "Content-Type application/xml is not supported for request bodies in this lab; send application/yang-data+json"
      }
    ]</pre>

<div class="eg"><p><b>Worked example.</b> A colleague pastes a failing call. Your checklist: is there an <code>Authorization</code> (or <code>-u</code>)? Is <code>Accept</code> asking for the format the script expects? If there is a body, does <code>Content-Type</code> match it? Three header questions solve most 401, 415 and "I got XML but wanted JSON" cases.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Believing base64 hides the password. (2) Sending Basic credentials over plain, unencrypted HTTP. (3) Disabling certificate checks "just to make it work" and leaving it that way. (4) Pasting real passwords into scripts or chat; use a placeholder and a secret store. (5) Wrong Content-Type for the body.</p></div>
<div class="exam"><p><b>Exam trap.</b> Basic authentication is base64 of user:password in the Authorization header and is not secure without TLS. Accept = format wanted in the reply; Content-Type = format of the body being sent. RESTCONF media types are application/yang-data+json and application/yang-data+xml.</p></div>

<div class="scn"><h4>The password in the screenshot</h4><p>A trainee posted a verbose call in a team chat to ask for help. The line <code>Authorization: Basic ...</code> was visible. A senior engineer decoded it in one command and read the real password. The account was rotated that day.</p><p><b>Lesson:</b> treat an Authorization header like the password itself. Remove it before sharing logs, and prefer tokens or secret stores in production.</p></div>

<div class="iv"><p class="q">"Is Basic authentication secure?"</p><p>Only when it runs inside TLS. The credentials are base64 encoded, which is reversible, not encrypted. So I use HTTPS, keep certificate verification on, use a least-privilege account, and never log the Authorization header.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Headers are labels: Authorization, Accept, Content-Type, WWW-Authenticate.</li>
<li>Basic authentication is base64, which is not encryption: always use HTTPS.</li>
<li>Accept picks the reply format; Content-Type describes the body you send.</li>
<li>Wrong Content-Type gives 415; missing credentials give 401.</li>
<li>Keep certificate verification on outside a throw-away lab.</li>
</ul></div>

`,hi:`

<p>API message ke do hisse hote hain: <b>headers</b> aur <b>body</b>. Headers chhote labels hain, har line mein ek, <code>Name: value</code> ke roop mein. Yeh doosri taraf ko batate hain ki aap kaun ho, kya padh sakte ho aur kya bhej rahe ho. Headers ko lifafe par likha hua samjho aur body ko andar ki chitthi.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Headers body se pehle, dono taraf jaate hain."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="150" height="80" rx="10" fill="#bae6fd"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">Client</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">Python / rest</text><rect x="480" y="50" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="555" y="87" text-anchor="middle" class="svg-ink" font-size="14">Router</text><text x="555" y="105" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF</text><line x1="160" y1="75" x2="480" y2="75" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="480" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">Authorization  Accept  Content-Type</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Content-Type  ETag  WWW-Authenticate</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="13">Headers = lifafe ke label; body = chitthi</text></svg><p class="cap">Headers body se pehle, dono taraf jaate hain.</p></div>

<h3>Chaar zaroori headers</h3>
<table class="cmp"><tr><th>Header</th><th>Kaun set karta hai</th><th>Kya kehta hai</th></tr>
<tr><td><code>Authorization</code></td><td>Client</td><td>Main kaun hoon (credentials)</td></tr>
<tr><td><code>Accept</code></td><td>Client</td><td>Wapas kaunsa format chahiye (JSON ya XML)</td></tr>
<tr><td><code>Content-Type</code></td><td>Jo body bhejta hai</td><td>Body kis format mein hai</td></tr>
<tr><td><code>WWW-Authenticate</code></td><td>Server, 401 par</td><td>Login kaise karna hai (jaise Basic)</td></tr></table>

<h3>Basic authentication, line by line</h3>
<p>Router par RESTCONF aam taur par <b>HTTP Basic authentication</b> use karta hai. Client <code>username:password</code> ko jodta hai, base64 mein badalta hai aur <code>Authorization</code> header mein rakhta hai. <code>-v</code> (verbose) option dikhata hai ki client ne asal mein kya bheja. <code>&gt;</code> se shuru lines hum bhejte hain; baaki reply hai:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback0/description -u apiuser:Api@2026 -v
* Connected to 10.99.0.1 port 443
* TLSv1.2 handshake done, server certificate is self-signed (accepted)
&gt; GET /restconf/data/ietf-interfaces:interfaces/interface=Loopback0/description HTTP/1.1
&gt; Host: 10.99.0.1
<span class="hl">&gt; Authorization: Basic YXBpdXNlcjpBcGlAMjAyNg==</span>
&gt;
HTTP/1.1 404 Not Found
Content-Type: application/yang-data+json

    ...</pre>
<p>Ajeeb text <code>YXBpdXNlcjpBcGlAMjAyNg==</code> bas <code>apiuser:Api@2026</code> hai jo base64 mein likha gaya hai. Base64 ek <b>encoding hai, encryption nahi</b>: jo bhi ise dekhe ek step mein wapas padh sakta hai. Isliye Basic authentication sirf HTTPS ke andar chalna chahiye, jahan poori baatcheet encrypted hoti hai. Certificate wali line dekho: lab router ka certificate <i>self-signed</i> hai, aur lab client use accept kar leta hai. Asli duniya mein aap aisa certificate lagate ho jise client trust kare, aur verification <b>on</b> rakhte ho. Verification band karna sirf throw-away lab ke liye hai.</p>

<h3>Accept: JSON ya XML chuno</h3>
<p>RESTCONF JSON ya XML mein jawab de sakta hai. Aap <code>Accept</code> se maangte ho. Server reply mein <code>Content-Type</code> se apna chunav confirm karta hai. Wahi Loopback0, XML mein:</p>
<pre class="out">AUTO&gt; rest GET .../interface=Loopback0 -u apiuser:Api@2026 -H 'Accept: application/yang-data+xml'
HTTP/1.1 200 OK
<span class="hl">Content-Type: application/yang-data+xml</span>
ETag: "1qqq4pp"

&lt;interface xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
  &lt;name&gt;Loopback0&lt;/name&gt;
  &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:softwareLoopback&lt;/type&gt;
  &lt;enabled&gt;true&lt;/enabled&gt;
  &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
    &lt;address&gt;
      &lt;ip&gt;1.1.1.1&lt;/ip&gt;
    ...</pre>
<p>Automation scripts lagbhag hamesha JSON pasand karti hain, kyunki Python JSON ko ek line mein dictionary bana deta hai. JSON media type <code>application/yang-data+json</code> hai.</p>

<h3>Content-Type: apni body ke baare mein sach bolo</h3>
<p>Body bhejte waqt <code>Content-Type</code> andar ki cheez se match karna chahiye. Nahi kiya, ya server woh format support nahi karta, to 415 milta hai. Yahan lab router sirf JSON bodies leta hai, aur hum jaanbujhkar XML announce karte hain:</p>
<pre class="out">AUTO&gt; rest PATCH .../interface=GigabitEthernet0%2F2 -u netops:NK@2026 -H 'Content-Type: application/xml' -d @gi2-up.json
<span class="hl">HTTP/1.1 415 Unsupported Media Type</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "application",
        "error-tag": "invalid-value",
        "error-message": "Content-Type application/xml is not supported for request bodies in this lab; send application/yang-data+json"
      }
    ]</pre>

<div class="eg"><p><b>Worked example.</b> Ek colleague fail hoti call paste karta hai. Aapki checklist: kya <code>Authorization</code> (ya <code>-u</code>) hai? Kya <code>Accept</code> wahi format maang raha hai jo script ko chahiye? Agar body hai to <code>Content-Type</code> usse match karta hai? Teen header sawaal zyadatar 401, 415 aur "XML mila par JSON chahiye tha" cases hal kar dete hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Maan lena ki base64 password chhupa deta hai. (2) Basic credentials ko plain, unencrypted HTTP par bhejna. (3) "Bas chal jaaye" ke liye certificate checks band karke waise hi chhod dena. (4) Asli passwords ko scripts ya chat mein paste karna; placeholder aur secret store use karo. (5) Body ke liye galat Content-Type.</p></div>
<div class="exam"><p><b>Exam trap.</b> Basic authentication Authorization header mein user:password ka base64 hai aur TLS ke bina secure nahi. Accept = reply mein chahiye format; Content-Type = bheji ja rahi body ka format. RESTCONF media types application/yang-data+json aur application/yang-data+xml hain.</p></div>

<div class="scn"><h4>Screenshot mein password</h4><p>Ek trainee ne madad maangne ke liye team chat mein verbose call post ki. <code>Authorization: Basic ...</code> wali line dikh rahi thi. Ek senior engineer ne ek command se use decode karke asli password padh liya. Account usi din rotate karna pada.</p><p><b>Lesson:</b> Authorization header ko password ki tarah maano. Logs share karne se pehle use hatao, aur production mein tokens ya secret store ko prefer karo.</p></div>

<div class="iv"><p class="q">"Kya Basic authentication secure hai?"</p><p>Sirf TLS ke andar. Credentials base64 encoded hote hain, jo reversible hai, encrypted nahi. Isliye main HTTPS use karta hoon, certificate verification on rakhta hoon, least-privilege account use karta hoon, aur Authorization header kabhi log nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Headers labels hain: Authorization, Accept, Content-Type, WWW-Authenticate.</li>
<li>Basic authentication base64 hai, encryption nahi: hamesha HTTPS use karo.</li>
<li>Accept reply ka format chunta hai; Content-Type bheji gayi body ko describe karta hai.</li>
<li>Galat Content-Type 415 deta hai; credentials na hon to 401.</li>
<li>Throw-away lab ke bahar certificate verification on rakho.</li>
</ul></div>

`}};export{e as default};