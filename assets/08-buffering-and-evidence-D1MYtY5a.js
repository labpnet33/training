var e={id:`buffering-and-evidence`,h:{en:`Buffering when the path is down and what it means for evidence`,hi:`Path down ho to buffering aur evidence ke liye iska matlab`},body:{en:`
<p>If the post office is closed, a sensible postman does not throw the letters away. He keeps them in the van and delivers when it opens. A firewall behaves the same way. When the path to Panorama is not ready, it keeps the logs it has already decided to forward and sends them later. That is <b>buffering</b>, and it is why the counter <b>waiting to be forwarded</b> exists.</p>

<h3>What gets buffered and what does not</h3>
<table class="tbl"><tr><th>Situation</th><th>What happens to the log</th></tr>
<tr><td>Rule does not log (log-end no)</td><td>Never written. There is nothing to buffer: the evidence does not exist.</td></tr>
<tr><td>Written, but the profile does not select it</td><td>Stays on the firewall as a local log. It is not queued for Panorama.</td></tr>
<tr><td>Selected, but the connection or collector is not ready</td><td>Queued as waiting. Delivered when the path returns.</td></tr>
</table>
<p>This table is the heart of the chapter. Buffering protects you against <b>path failures</b>. It cannot protect you against <b>configuration mistakes</b>, because a log that was never written or never selected has nothing waiting for the path to return.</p>

<h3>Seeing it in the lab</h3>
<p>The counters for a healthy firewall are all equal. When the path fails, created grows, forwarded stops and waiting climbs. A reference of a firewall with a broken path (for illustration):</p>
<pre class="code">Traffic logs:
    Total logs created                : 12
    Forwarded to Panorama             : 4
    Waiting to be forwarded           : 8</pre>
<p>Twelve written, four delivered before the failure, eight waiting. When the connection or the collector group is fixed, the eight are delivered and waiting returns to zero. In the lab, run the firewall status command again after the fix and watch the number move.</p>

<h3>The limits of buffering</h3>
<ul>
<li><b>Space is finite.</b> A firewall can hold only so much. In a long outage with heavy traffic, the oldest logs may be overwritten. How much is held depends on the model and version: check the documentation for your PAN-OS version.</li>
<li><b>Delayed does not mean lost, but it does mean late.</b> A SIEM alert based on a denied session may fire hours after the event. Time stamps are from the event, so analysis is still correct, but real-time use cases suffer.</li>
<li><b>Order may differ.</b> After recovery a burst arrives together. Do not assume the SIEM saw events in the order they happened.</li>
<li><b>Syslog over UDP</b> has no buffer-until-delivered promise on the network. A lost datagram is simply gone.</li>
</ul>

<h3>Evidence handling</h3>
<p>When logs are used as evidence in an investigation or an audit, the story must be defensible. Practical habits:</p>
<ol>
<li>Record the outage window: when the connection or collector failed and when it recovered.</li>
<li>After recovery, confirm waiting is back to zero and that Panorama's received count matches the firewall's created count.</li>
<li>If the firewall rolled over its buffer during the outage, state this honestly in the report instead of implying completeness.</li>
<li>Keep an extract of the relevant logs in a protected place and record who exported it and when.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Believing that all gaps will self-heal; ignoring a growing waiting counter for days; treating a missing log as proof that traffic did not happen.</p></div>
<div class="exam"><p><b>Exam trap.</b> Absence of a log is not proof of absence of traffic. First prove that logging was enabled, selected, connected and healthy for that time.</p></div>

<div class="scn"><h4>Eight days of waiting</h4><p>The management connection of one branch firewall dropped after a network change. Users were fine, nobody looked, and the waiting counter grew for eight days. When the connection was restored the backlog arrived, but the oldest entries had already been overwritten. The incident team that later asked about day one found nothing and had to say so.</p><p><b>Lesson:</b> alert on the waiting counter, not only on the connection, and fix path failures within hours.</p></div>

<div class="iv"><p class="q">"The link between a firewall and Panorama was down for a day. Are the logs lost?"</p><p>Not necessarily. Logs the firewall had selected for forwarding are buffered and delivered when the path returns, so I check that waiting returns to zero and compare created with received. But the buffer is finite, so I verify there was no overwrite, and I tell the audience if there was a gap.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Buffering protects against path failures, not configuration mistakes.</li>
<li>Waiting to be forwarded means safe on the firewall, not yet central.</li>
<li>Buffers are finite; long outages can lose old logs.</li>
<li>Absence of a log is not proof that nothing happened; prove logging was healthy first.</li>
</ul></div>
`,hi:`
<p>Post office band ho to samajhdar postman chitthiyaan phenkta nahi. Wo unhe van mein rakhta hai aur khulne par deliver karta hai. Firewall bhi aisa hi karta hai. Panorama ka path ready na ho to jo logs wo pehle hi forward karne ka decide kar chuka hai unhe rakh leta hai aur baad mein bhejta hai. Ye <b>buffering</b> hai, aur isi liye counter <b>waiting to be forwarded</b> exist karta hai.</p>

<h3>Kya buffer hota hai aur kya nahi</h3>
<table class="tbl"><tr><th>Situation</th><th>Log ka kya hota hai</th></tr>
<tr><td>Rule log nahi karta (log-end no)</td><td>Kabhi likha hi nahi gaya. Buffer karne ko kuch nahi: evidence exist hi nahi karta.</td></tr>
<tr><td>Likha gaya, lekin profile ne select nahi kiya</td><td>Firewall par local log ke roop mein rehta hai. Panorama ke liye queue nahi hota.</td></tr>
<tr><td>Select hua, lekin connection ya collector ready nahi</td><td>Waiting mein queue hota hai. Path wapas aane par deliver hota hai.</td></tr>
</table>
<p>Ye table chapter ka dil hai. Buffering <b>path failures</b> se bachati hai. <b>Configuration mistakes</b> se nahi bacha sakti, kyunki jo log kabhi likha ya select hi nahi hua uske liye path wapas aane ka intezaar karne wala kuch nahi.</p>

<h3>Lab mein dekhna</h3>
<p>Healthy firewall ke counters sab barabar hote hain. Path fail ho to created badhta hai, forwarded ruk jata hai aur waiting chadhta hai. Toote path wale firewall ka reference (samajhne ke liye):</p>
<pre class="code">Traffic logs:
    Total logs created                : 12
    Forwarded to Panorama             : 4
    Waiting to be forwarded           : 8</pre>
<p>Barah likhe gaye, chaar failure se pehle deliver hue, aath waiting. Connection ya collector group fix hone par aathon deliver ho jate hain aur waiting zero par aa jata hai. Lab mein fix ke baad firewall status command phir chalao aur number ko hilte dekho.</p>

<h3>Buffering ki limits</h3>
<ul>
<li><b>Jagah limited hai.</b> Firewall utna hi rakh sakta hai. Lambe outage mein heavy traffic ho to sabse purane logs overwrite ho sakte hain. Kitna rakha jata hai model aur version par depend karta hai: apne PAN-OS version ki documentation check karo.</li>
<li><b>Delay ka matlab loss nahi, lekin late zaroor.</b> Denied session par SIEM alert event ke ghanton baad fire ho sakta hai. Time stamps event ke hote hain isliye analysis sahi rehta hai, lekin real-time use cases ko nuksan hota hai.</li>
<li><b>Order alag ho sakta hai.</b> Recovery ke baad ek burst saath aata hai. Ye mat maano ki SIEM ne events usi order mein dekhe jisme hue.</li>
<li><b>UDP par syslog</b> network par deliver hone tak buffer ka wada nahi deta. Khoya datagram bas gaya.</li>
</ul>

<h3>Evidence handling</h3>
<p>Logs jab investigation ya audit mein evidence ke taur par use hon, kahani defend karne layak honi chahiye. Practical aadatein:</p>
<ol>
<li>Outage window record karo: connection ya collector kab fail hua aur kab wapas aaya.</li>
<li>Recovery ke baad confirm karo ki waiting zero hai aur Panorama ka received count firewall ke created count se match karta hai.</li>
<li>Outage mein firewall ne buffer overwrite kiya ho to report mein imaandari se likho, completeness ka dikhawa mat karo.</li>
<li>Relevant logs ka extract protected jagah rakho aur record karo kisne kab export kiya.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Ye maan lena ki saare gaps apne aap bhar jayenge; waiting counter ko dinon tak badhte hue ignore karna; missing log ko is baat ka proof maan lena ki traffic hua hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Log ka na hona traffic na hone ka proof nahi hai. Pehle prove karo ki us time ke liye logging enabled, selected, connected aur healthy thi.</p></div>

<div class="scn"><h4>Aath din ki waiting</h4><p>Network change ke baad ek branch firewall ka management connection toot gaya. Users theek the, kisi ne nahi dekha, aur waiting counter aath din badhta raha. Connection restore hone par backlog aaya, lekin sabse purani entries overwrite ho chuki thin. Incident team ne baad mein pehle din ke baare mein poocha to kuch nahi mila aur unhe wahi batana pada.</p><p><b>Lesson:</b> sirf connection par nahi, waiting counter par bhi alert do, aur path failures ghanton mein fix karo.</p></div>

<div class="iv"><p class="q">"Firewall aur Panorama ke beech link ek din down tha. Kya logs khoye?"</p><p>Zaroori nahi. Jo logs firewall ne forward ke liye select kiye the wo buffer hote hain aur path wapas aane par deliver hote hain, isliye main check karta hoon ki waiting zero ho gaya aur created ko received se compare karta hoon. Lekin buffer limited hai, to verify karta hoon ki overwrite nahi hua, aur gap ho to audience ko batata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Buffering path failures se bachati hai, configuration mistakes se nahi.</li>
<li>Waiting to be forwarded ka matlab firewall par safe, abhi central nahi.</li>
<li>Buffers limited hain; lambe outages mein purane logs ja sakte hain.</li>
<li>Log ka na hona proof nahi ki kuch hua nahi; pehle prove karo logging healthy thi.</li>
</ul></div>
`}};export{e as default};