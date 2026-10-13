var e={id:`url-filtering`,h:{en:`URL filtering: categories, reputation and block pages`,hi:`URL filtering: categories, reputation aur block pages`},body:{en:`
<p>A city library sorts every book into a <b>section</b> (history, cooking, adult fiction) and the librarian keeps a note on how <b>trustworthy</b> each publisher is. A school trip can then be told "children may visit any section except adult fiction, and never borrow from a publisher marked untrustworthy". You do not need to list every book. <b>URL filtering</b> works the same way: Cisco Talos has sorted hundreds of millions of websites into <b>categories</b> and gives each one a <b>reputation</b>. Your rules name categories and a reputation threshold, and every new site that Talos classifies is covered automatically.</p>

<h3>Categories and reputation</h3>
<p>A <b>URL category</b> describes what a site is: Business and Economy, News and Media, Social Networking, Streaming Media, Gambling, Malware Sites, Phishing and Other Frauds, Computers and Internet, Shopping and many more. A site that Talos has not classified yet is <b>Uncategorized</b>. The <b>reputation</b> describes how risky the site is:</p>
<table class="cmp"><tr><th>Level</th><th>Reputation</th><th>Meaning</th></tr>
<tr><td>5</td><td>Trusted</td><td>well-known, clean sites</td></tr>
<tr><td>4</td><td>Favorable</td><td>no sign of risk</td></tr>
<tr><td>3</td><td>Neutral</td><td>little history, no clear risk</td></tr>
<tr><td>2</td><td>Questionable</td><td>some risk indicators</td></tr>
<tr><td>1</td><td>Untrusted</td><td>known malicious or very high risk</td></tr></table>
<p>When a rule names a category <i>and</i> a reputation, the direction depends on the action. In a <b>Block</b> rule, choosing Questionable matches Questionable <b>and worse</b> (Untrusted). In an <b>Allow</b> rule, choosing Favorable matches Favorable <b>and better</b> (Trusted). An option decides whether sites with an <b>unknown reputation</b> also match.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Reputation threshold in block and allow rules">
<rect x="40" y="40" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="65" text-anchor="middle" class="svg-ink" font-size="12">5 Trusted</text>
<rect x="150" y="40" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="200" y="65" text-anchor="middle" class="svg-ink" font-size="12">4 Favorable</text>
<rect x="260" y="40" width="100" height="40" rx="6" fill="#e2e8f0"/><text x="310" y="65" text-anchor="middle" class="svg-ink" font-size="12">3 Neutral</text>
<rect x="370" y="40" width="110" height="40" rx="6" fill="#fde68a"/><text x="425" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Questionable</text>
<rect x="490" y="40" width="100" height="40" rx="6" fill="#fed7aa"/><text x="540" y="65" text-anchor="middle" class="svg-ink" font-size="12">1 Untrusted</text>
<line x1="370" y1="110" x2="590" y2="110" stroke="#64748b" stroke-width="3"/><text x="480" y="132" text-anchor="middle" class="svg-accent" font-size="12">Block rule "Questionable": 2 and worse</text>
<line x1="40" y1="160" x2="250" y2="160" stroke="#64748b" stroke-width="3"/><text x="145" y="182" text-anchor="middle" class="svg-accent" font-size="12">Allow rule "Favorable": 4 and better</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Unknown reputation matches only if you tick the option</text>
</svg><p class="cap">The same reputation slider means "this level and worse" in a Block rule and "this level and better" in an Allow rule.</p></div>

<h3>How the lookup happens</h3>
<p>Threat Defense needs the host name, so URL rules decide after the HTTP request or TLS ClientHello arrives. The Management Center keeps a local URL database; for sites not in it, the device can <b>query the Cisco cloud for unknown URLs</b> and caches the answer. This needs the <b>URL license</b> on the device. Manually listed URLs in a URL object need no license; URL Security Intelligence lists come with the IPS license.</p>
<p>For HTTPS without decryption, the category comes from the <b>SNI</b> or certificate: you can block "Gambling" on HTTPS, but you cannot match a path such as <code>/downloads/</code>, because the path is inside the encrypted request.</p>

<h3>Block pages and interactive block</h3>
<p>For plain HTTP, Threat Defense can answer a blocked request with an <b>HTTP response page</b>: a system-provided "Access Denied" page (status 403) or your own custom page. The <b>Interactive Block</b> action shows a warning page with a Continue button; if the user continues, the site is allowed for a <b>bypass timeout</b> (600 seconds by default) and the event is logged as a user bypass. On undecrypted HTTPS no page can be injected, so the user only sees a reset or a timeout.</p>

<h3>Lab walkthrough: URL filtering for the office</h3>
<pre class="code"><span class="c">! Policies &gt; Access Control &gt; NK-ACP &gt; Add Rule (position 1)</span>
Name:      Block-Gambling
Action:    Block
Zones:     INSIDE -&gt; OUTSIDE
URLs:      Categories Gambling, Malware Sites   (Reputation: Any)
Logging:   Log at Beginning of Connection
<span class="c">! NK-ACP &gt; Advanced &gt; HTTP Responses: Block Response Page = System-provided</span>
<span class="c">! Rule order now: 1 Block-Gambling  2 Block-Social  3 Inside-Out</span>
Deploy</pre>

<pre class="out">PC1&gt; curl royal-casino.example
<span class="hl">&lt;html&gt;&lt;head&gt;&lt;title&gt;Access Denied&lt;/title&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;Access Denied&lt;/h1&gt;</span>&lt;p&gt;You are attempting to access a forbidden site.&lt;/p&gt;&lt;p&gt;Consult your system administrator for details.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NK Daily News&lt;/h1&gt;...

Analysis &gt; Connections &gt; Events
Action  Reason      Rule            URL                   URL Category  URL Reputation
Block   <span class="hl">URL Block</span>   Block-Gambling  royal-casino.example  Gambling      Questionable
Block               Block-Social    www.facebook.com      Social Netw.  Trusted
Allow               Inside-Out      erp.partner.example   Business ...  Trusted</pre>

<p>The answer to the lab's last task is in the <b>Reason</b> column: <b>URL Block</b>. The C2 domain update-check.badsite.example (category Malware Sites) is also blocked by this rule, a second layer behind Security Intelligence.</p>

<div class="eg"><p><b>Worked example: reputation without categories.</b> A bank wants to block risky sites whatever their category. Rule "Block-Risky": INSIDE to OUTSIDE, URLs = Category Any with Reputation <b>Questionable</b>, action Block, placed above Inside-Out. royal-casino.example (Questionable) and login-verify.example (Untrusted) are blocked; files.example (Neutral) and news.example (Favorable) pass.</p></div>

<div class="warn"><p><b>Common mistake.</b> Expecting the block page for HTTPS sites. Without decryption the firewall cannot inject a page into a TLS session, so users see a browser error and call the helpdesk saying "the internet is broken". Tell users, or decrypt the categories where a page matters.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reputation direction: Block rules match the selected level and <b>worse</b>, Allow rules the selected level and <b>better</b>. URL category filtering requires the <b>URL</b> license; manual URL objects do not. Interactive Block works only where a page can be shown (HTTP or decrypted HTTPS).</p></div>

<div class="scn"><h4>The new supplier portal nobody could open</h4><p>A manufacturer blocked "Uncategorized" to stop fresh phishing domains. A week later the purchasing team could not reach a brand-new supplier portal. The connection event showed Reason URL Block, category Uncategorized. The engineer added the portal's host to a URL object in an Allow rule above the block, and submitted the site to Talos for categorisation. Two days later it was classified as Business and Economy and the exception was removed.</p><p><b>Lesson:</b> blocking Uncategorized is strong but needs a fast exception process.</p></div>

<div class="iv"><p class="q">"How does URL filtering work on HTTPS if you are not decrypting?"</p><p>The device reads the server name from the TLS ClientHello SNI or the certificate and looks up its category and reputation, so category and reputation rules still work. It cannot see the path or query string, so path-based rules do not match, and it cannot show a block page; the session is reset or dropped. Mention the reputation levels and direction, the URL license, cloud lookup for unknown URLs, and Interactive Block with its bypass timeout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Talos categories plus five reputation levels: Trusted, Favorable, Neutral, Questionable, Untrusted.</li>
<li>Block rules match the level and worse; Allow rules the level and better.</li>
<li>Block page and Interactive Block only work on HTTP or decrypted HTTPS.</li>
<li>HTTPS without decryption: category from SNI or certificate, no path visibility.</li>
<li>The connection event Reason URL Block confirms a URL rule did the blocking.</li>
</ul></div>
`,hi:`
<p>Ek city library har kitaab ko ek <b>section</b> (history, cooking, adult fiction) mein rakhti hai aur librarian har publisher ke <b>bharosemand</b> hone ka note rakhta hai. Phir school trip ko keh sakte hain "bachche adult fiction ke alawa koi bhi section dekh sakte hain, aur untrustworthy marked publisher se kabhi kitaab nahi lenge". Har kitaab ki list banane ki zaroorat nahi. <b>URL filtering</b> aise hi kaam karta hai: Cisco Talos ne karodon websites ko <b>categories</b> mein baanta hai aur har ek ko ek <b>reputation</b> di hai. Aapki rules categories aur reputation threshold ka naam leti hain, aur Talos jo bhi nayi site classify karta hai woh apne aap cover ho jaati hai.</p>

<h3>Categories aur reputation</h3>
<p><b>URL category</b> batati hai site kya hai: Business and Economy, News and Media, Social Networking, Streaming Media, Gambling, Malware Sites, Phishing and Other Frauds, Computers and Internet, Shopping aur bahut saari. Jo site Talos ne abhi classify nahi ki woh <b>Uncategorized</b> hai. <b>Reputation</b> batati hai site kitni risky hai:</p>
<table class="cmp"><tr><th>Level</th><th>Reputation</th><th>Matlab</th></tr>
<tr><td>5</td><td>Trusted</td><td>jaani-maani, saaf sites</td></tr>
<tr><td>4</td><td>Favorable</td><td>risk ka koi sign nahi</td></tr>
<tr><td>3</td><td>Neutral</td><td>kam history, saaf risk nahi</td></tr>
<tr><td>2</td><td>Questionable</td><td>kuch risk indicators</td></tr>
<tr><td>1</td><td>Untrusted</td><td>known malicious ya bahut high risk</td></tr></table>
<p>Jab rule category <i>aur</i> reputation dono ka naam leti hai, to direction action par depend karti hai. <b>Block</b> rule mein Questionable chunne se Questionable <b>aur usse kharab</b> (Untrusted) match hota hai. <b>Allow</b> rule mein Favorable chunne se Favorable <b>aur usse behtar</b> (Trusted) match hota hai. Ek option decide karta hai ki <b>unknown reputation</b> wali sites bhi match hon ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Block aur allow rules mein reputation threshold">
<rect x="40" y="40" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="65" text-anchor="middle" class="svg-ink" font-size="12">5 Trusted</text>
<rect x="150" y="40" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="200" y="65" text-anchor="middle" class="svg-ink" font-size="12">4 Favorable</text>
<rect x="260" y="40" width="100" height="40" rx="6" fill="#e2e8f0"/><text x="310" y="65" text-anchor="middle" class="svg-ink" font-size="12">3 Neutral</text>
<rect x="370" y="40" width="110" height="40" rx="6" fill="#fde68a"/><text x="425" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Questionable</text>
<rect x="490" y="40" width="100" height="40" rx="6" fill="#fed7aa"/><text x="540" y="65" text-anchor="middle" class="svg-ink" font-size="12">1 Untrusted</text>
<line x1="370" y1="110" x2="590" y2="110" stroke="#64748b" stroke-width="3"/><text x="480" y="132" text-anchor="middle" class="svg-accent" font-size="12">Block rule "Questionable": 2 aur kharab</text>
<line x1="40" y1="160" x2="250" y2="160" stroke="#64748b" stroke-width="3"/><text x="145" y="182" text-anchor="middle" class="svg-accent" font-size="12">Allow rule "Favorable": 4 aur behtar</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Unknown reputation tabhi match hoti hai jab option tick ho</text>
</svg><p class="cap">Wahi reputation slider Block rule mein "yeh level aur kharab" aur Allow rule mein "yeh level aur behtar" hota hai.</p></div>

<h3>Lookup kaise hota hai</h3>
<p>Threat Defense ko host name chahiye, isliye URL rules HTTP request ya TLS ClientHello aane ke baad decide karti hain. Management Center local URL database rakhta hai; jo sites usme nahi hain unke liye device <b>unknown URLs ke liye Cisco cloud query</b> kar sakta hai aur jawab cache karta hai. Iske liye device par <b>URL license</b> chahiye. URL object mein manually listed URLs ko license nahi chahiye; URL Security Intelligence lists IPS license ke saath aati hain.</p>
<p>Decryption ke bina HTTPS ke liye category <b>SNI</b> ya certificate se aati hai: aap HTTPS par "Gambling" block kar sakte ho, lekin <code>/downloads/</code> jaisa path match nahi kar sakte, kyunki path encrypted request ke andar hai.</p>

<h3>Block pages aur interactive block</h3>
<p>Plain HTTP ke liye Threat Defense blocked request ka jawab <b>HTTP response page</b> se de sakta hai: system-provided "Access Denied" page (status 403) ya aapka apna custom page. <b>Interactive Block</b> action Continue button wala warning page dikhata hai; agar user continue kare, to site ek <b>bypass timeout</b> (default 600 seconds) ke liye allow hoti hai aur event user bypass ki tarah log hota hai. Undecrypted HTTPS par koi page inject nahi ho sakta, isliye user ko sirf reset ya timeout dikhta hai.</p>

<h3>Lab walkthrough: office ke liye URL filtering</h3>
<pre class="code"><span class="c">! Policies &gt; Access Control &gt; NK-ACP &gt; Add Rule (position 1)</span>
Name:      Block-Gambling
Action:    Block
Zones:     INSIDE -&gt; OUTSIDE
URLs:      Categories Gambling, Malware Sites   (Reputation: Any)
Logging:   Log at Beginning of Connection
<span class="c">! NK-ACP &gt; Advanced &gt; HTTP Responses: Block Response Page = System-provided</span>
<span class="c">! Ab rule order: 1 Block-Gambling  2 Block-Social  3 Inside-Out</span>
Deploy</pre>

<pre class="out">PC1&gt; curl royal-casino.example
<span class="hl">&lt;html&gt;&lt;head&gt;&lt;title&gt;Access Denied&lt;/title&gt;&lt;/head&gt;&lt;body&gt;&lt;h1&gt;Access Denied&lt;/h1&gt;</span>&lt;p&gt;You are attempting to access a forbidden site.&lt;/p&gt;&lt;p&gt;Consult your system administrator for details.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;
PC1&gt; curl news.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;NK Daily News&lt;/h1&gt;...

Analysis &gt; Connections &gt; Events
Action  Reason      Rule            URL                   URL Category  URL Reputation
Block   <span class="hl">URL Block</span>   Block-Gambling  royal-casino.example  Gambling      Questionable
Block               Block-Social    www.facebook.com      Social Netw.  Trusted
Allow               Inside-Out      erp.partner.example   Business ...  Trusted</pre>

<p>Lab ke aakhri task ka jawab <b>Reason</b> column mein hai: <b>URL Block</b>. C2 domain update-check.badsite.example (category Malware Sites) bhi is rule se block hota hai, Security Intelligence ke peeche ek doosri layer.</p>

<div class="eg"><p><b>Worked example: categories ke bina reputation.</b> Ek bank risky sites ko category chahe jo ho block karna chahta hai. Rule "Block-Risky": INSIDE se OUTSIDE, URLs = Category Any aur Reputation <b>Questionable</b>, action Block, Inside-Out ke upar. royal-casino.example (Questionable) aur login-verify.example (Untrusted) block hote hain; files.example (Neutral) aur news.example (Favorable) pass hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> HTTPS sites ke liye block page ki umeed karna. Decryption ke bina firewall TLS session mein page inject nahi kar sakta, isliye users ko browser error dikhta hai aur woh helpdesk ko call karte hain ki "internet toot gaya". Users ko batao, ya jin categories mein page zaroori hai unhe decrypt karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reputation direction: Block rules chune hue level aur <b>kharab</b> ko match karti hain, Allow rules chune hue level aur <b>behtar</b> ko. URL category filtering ko <b>URL</b> license chahiye; manual URL objects ko nahi. Interactive Block sirf wahan chalta hai jahan page dikhaya ja sake (HTTP ya decrypted HTTPS).</p></div>

<div class="scn"><h4>Naya supplier portal jo koi khol nahi paaya</h4><p>Ek manufacturer ne fresh phishing domains rokne ke liye "Uncategorized" block kiya. Ek hafte baad purchasing team ek bilkul naye supplier portal tak nahi pahunch paayi. Connection event mein Reason URL Block, category Uncategorized tha. Engineer ne block ke upar ek Allow rule mein portal ka host URL object mein joda, aur site ko categorisation ke liye Talos ko submit kiya. Do din baad woh Business and Economy classify hui aur exception hata diya gaya.</p><p><b>Lesson:</b> Uncategorized block karna strong hai lekin tez exception process chahiye.</p></div>

<div class="iv"><p class="q">"Agar aap decrypt nahi kar rahe, to HTTPS par URL filtering kaise kaam karti hai?"</p><p>Device TLS ClientHello SNI ya certificate se server name padhta hai aur uski category aur reputation lookup karta hai, isliye category aur reputation rules phir bhi kaam karti hain. Woh path ya query string nahi dekh sakta, isliye path-based rules match nahi hoti, aur block page nahi dikha sakta; session reset ya drop hota hai. Reputation levels aur direction, URL license, unknown URLs ke liye cloud lookup, aur bypass timeout ke saath Interactive Block batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Talos categories plus paanch reputation levels: Trusted, Favorable, Neutral, Questionable, Untrusted.</li>
<li>Block rules level aur kharab ko match karti hain; Allow rules level aur behtar ko.</li>
<li>Block page aur Interactive Block sirf HTTP ya decrypted HTTPS par chalte hain.</li>
<li>Decryption ke bina HTTPS: category SNI ya certificate se, path visibility nahi.</li>
<li>Connection event Reason URL Block confirm karta hai ki URL rule ne block kiya.</li>
</ul></div>
`}};export{e as default};