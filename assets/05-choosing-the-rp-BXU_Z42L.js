var e={id:`choosing-the-rp`,h:{en:`How an RP is chosen when ranges overlap, and which method to use`,hi:`Ranges overlap hon to RP kaise chuna jaata hai, aur kaunsa method use karein`},body:{en:`
<p>Real networks mix methods. A router may have a static line, an Auto-RP mapping and a BSR set at the same time, with ranges that overlap. This chapter gives you one clear order to predict the winner, so that on an exam or in a fault you never guess.</p>

<h3>Two ideas to keep apart</h3>
<p><b>First: which methods are consulted, and in what order?</b> <b>Second: inside one method, which RP wins?</b> We answered the second question in chapters 3 and 4 (Auto-RP: highest address per range; BSR: longest range, lowest priority, hash, highest address). Now the first question.</p>

<h3>The order a router follows</h3>
<ol>
<li><b>Never mapped:</b> SSM groups (when <code>ip pim ssm</code> is on, 232.0.0.0/8 by default) and the Auto-RP groups 224.0.1.39 and 224.0.1.40 have no RP at all.</li>
<li><b>Static with <code>override</code>.</b> If a static line with <code>override</code> matches the group, it wins, even over learned RPs. (With several, the highest RP address wins.)</li>
<li><b>Learned RPs (Auto-RP and BSR).</b> The <b>longest matching group range</b> wins. If Auto-RP and BSR offer the same range, Auto-RP is preferred in IOS XE. Within BSR the rules of chapter 4 apply.</li>
<li><b>Other static lines.</b> They are used only when nothing learned covers the group, so they work as a <b>fallback</b>. Among several, the highest RP address wins.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Order of RP selection">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">0  SSM range and 224.0.1.39/40: no RP</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">1  static RP with override</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">2  learned: longest range, then Auto-RP before BSR</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3  other static lines: fallback</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">First match from the top decides the RP for the group.</text>
</svg><p class="cap">Read from the top; the first rule that applies decides.</p></div>

<h3>Worked example with numbers</h3>
<div class="eg"><p>Router R4 has these facts at the same time: a BSR set with C-RP 3.3.3.3 (priority 5) for 224.0.0.0/4 and C-RP 5.5.5.5 (priority 200) for 239.50.0.0/16; a static line <code>ip pim rp-address 8.8.8.8</code> with no ACL; and no override.</p></div>
<table class="cmp"><tr><th>Group</th><th>RP chosen</th><th>Why</th></tr>
<tr><td>239.20.1.1</td><td>3.3.3.3</td><td>Only the /4 range covers it; learned beats the static fallback</td></tr>
<tr><td>239.50.1.1</td><td>5.5.5.5</td><td>/16 is longer than /4, the priority 200 is never compared</td></tr>
<tr><td>232.1.1.1 (with <code>ip pim ssm default</code>)</td><td>none</td><td>SSM range never uses an RP</td></tr>
</table>
<p>Now the BSR candidates disappear (the BSR was shut). Group 239.20.1.1 now uses 8.8.8.8, the static fallback. If the engineer then adds <code>ip pim rp-address 9.9.9.9 override</code> on R4 only, R4 uses 9.9.9.9 even while the BSR is back, while every other router keeps the learned RP. R4's receivers now join a different RP from R4's neighbours: a classic silent fault.</p>

<h3>Show commands that tell you which source won</h3>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    <span class="hl">Info source: 1.1.1.1 (?), via bootstrap</span>, priority 5, holdtime 150
Group(s) 239.50.0.0/16
  RP 5.5.5.5 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 200, holdtime 150

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 8.8.8.8 (?)</span></pre>
<p>A static entry is printed even when a learned mapping wins, so do not conclude from this list that R4 uses 8.8.8.8. Ask the router about one group instead: look at the RP printed in <code>show ip mroute 239.20.1.1</code>.</p>

<h3>Comparison of the four methods</h3>
<table class="cmp"><tr><th></th><th>Static</th><th>Auto-RP</th><th>BSR</th><th>Anycast RP</th></tr>
<tr><td>Standard</td><td>n/a</td><td>Cisco only</td><td>Open (PIMv2)</td><td>Open (MSDP)</td></tr>
<tr><td>Config effort</td><td>every router</td><td>few routers</td><td>few routers</td><td>2 RPs + MSDP</td></tr>
<tr><td>Redundancy</td><td>none by itself</td><td>second RP / agent</td><td>second C-RP / C-BSR</td><td>built in</td></tr>
<tr><td>Load sharing</td><td>by ACL ranges</td><td>by ranges</td><td>by ranges and hash</td><td>by topology (nearest RP)</td></tr>
<tr><td>Extra needs</td><td>none</td><td>listener / dense</td><td>none</td><td>same address on loopbacks</td></tr>
</table>
<h4>Which to choose?</h4>
<ul>
<li>Small or stable network, one site: <b>static</b>. Easy to read and troubleshoot.</li>
<li>All Cisco and you inherit it: <b>Auto-RP</b>, with a listener and two agents.</li>
<li>Mixed vendors or you want load sharing: <b>BSR</b>.</li>
<li>You need RP redundancy with fast failover: <b>anycast RP</b> (with static RP pointing at the anycast address).</li>
</ul>
<p>Avoid running Auto-RP and BSR at the same time in one domain: it works, but nobody on the team can predict the result at 2 a.m.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading the <i>Static</i> block of <code>show ip pim rp mapping</code> as the active RP. (2) Leaving an <code>override</code> after a test. (3) Expecting the lowest priority to win in the Auto-RP agent; the agent compares addresses, not priorities.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question that lists a static RP, a BSR RP and an Auto-RP RP for the same group is usually checking the order: override static, then learned (Auto-RP before BSR for the same range, longest range first), then plain static.</p></div>

<div class="scn"><h4>The router that disagreed</h4><p>After a weekend test of a new RP, Bharat Retail's Hyderabad router kept <code>ip pim rp-address 7.7.7.7 override</code>. On Monday the Hyderabad store managers could not watch the training channel while all other cities could. <code>show ip pim rp mapping</code> on the Hyderabad router showed <code>Static-Override</code> at the end. The engineer removed the line and the router used the learned RP again.</p><p><b>Lesson:</b> compare the RP used on the failing router with a working one for the same group; if they differ, look for override.</p></div>

<div class="iv"><p class="q">"A router has a static RP and a BSR-learned RP for the same group. Which one is used?"</p><p>Strong answer: the BSR-learned one, because a plain static line is only a fallback. If the static line has <code>override</code>, the static RP wins on that router. Add that you would verify with <code>show ip pim rp mapping</code> and the RP shown in <code>show ip mroute</code>, and that you would never leave an override in production without a reason.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: no-RP groups, static override, learned (longest range, Auto-RP before BSR), plain static fallback.</li>
<li>The longest group range wins before any priority or address is compared.</li>
<li>Static entries are printed even when they are not used.</li>
<li>Choose static for small, BSR for mixed vendors, Auto-RP for existing Cisco, anycast RP for redundancy.</li>
</ul></div>
`,hi:`
<p>Real networks mein methods mix hote hain. Ek router ke paas ek saath static line, Auto-RP mapping aur BSR set ho sakta hai, jinki ranges overlap karti hain. Yeh chapter aapko winner predict karne ke liye ek clear order deta hai, taaki exam mein ya fault mein aapko guess na karna pade.</p>

<h3>Do ideas jo alag rakhne hain</h3>
<p><b>Pehla: kaunse methods dekhe jaate hain, aur kis order mein?</b> <b>Doosra: ek method ke andar kaunsa RP jeetta hai?</b> Doosre sawal ka jawab chapters 3 aur 4 mein tha (Auto-RP: har range par sabse high address; BSR: longest range, lowest priority, hash, highest address). Ab pehla sawal.</p>

<h3>Router jo order follow karta hai</h3>
<ol>
<li><b>Kabhi map nahi hote:</b> SSM groups (jab <code>ip pim ssm</code> on ho, default 232.0.0.0/8) aur Auto-RP groups 224.0.1.39 aur 224.0.1.40 ka koi RP nahi hota.</li>
<li><b>Static with <code>override</code>.</b> Agar <code>override</code> wali static line group ko match kare, to woh jeetti hai, learned RPs par bhi. (Kai hon to sabse high RP address jeetta hai.)</li>
<li><b>Learned RPs (Auto-RP aur BSR).</b> <b>Sabse lambi matching group range</b> jeetti hai. Agar Auto-RP aur BSR same range offer karein, to IOS XE mein Auto-RP preferred hai. BSR ke andar chapter 4 ke rules lagte hain.</li>
<li><b>Baaki static lines.</b> Yeh tabhi use hoti hain jab koi learned entry group ko cover na kare, isliye yeh <b>fallback</b> ki tarah kaam karti hain. Kai hon to sabse high RP address jeetta hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="RP selection ka order">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#fed7aa"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">0  SSM range aur 224.0.1.39/40: koi RP nahi</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="13">1  override ke saath static RP</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">2  learned: longest range, phir Auto-RP BSR se pehle</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#bae6fd"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">3  baaki static lines: fallback</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Upar se pehla match group ka RP decide karta hai.</text>
</svg><p class="cap">Upar se padho; pehla rule jo lagta hai woh decide karta hai.</p></div>

<h3>Numbers ke saath worked example</h3>
<div class="eg"><p>Router R4 ke paas ek saath yeh facts hain: BSR set jisme 224.0.0.0/4 ke liye C-RP 3.3.3.3 (priority 5) aur 239.50.0.0/16 ke liye C-RP 5.5.5.5 (priority 200); bina ACL ke static line <code>ip pim rp-address 8.8.8.8</code>; aur koi override nahi.</p></div>
<table class="cmp"><tr><th>Group</th><th>Chuna gaya RP</th><th>Kyun</th></tr>
<tr><td>239.20.1.1</td><td>3.3.3.3</td><td>Sirf /4 range ise cover karti hai; learned static fallback ko haraata hai</td></tr>
<tr><td>239.50.1.1</td><td>5.5.5.5</td><td>/16 /4 se lamba hai, priority 200 kabhi compare hi nahi hoti</td></tr>
<tr><td>232.1.1.1 (<code>ip pim ssm default</code> ke saath)</td><td>koi nahi</td><td>SSM range kabhi RP use nahi karta</td></tr>
</table>
<p>Ab BSR candidates gayab ho jaate hain (BSR shut kar diya). Group 239.20.1.1 ab 8.8.8.8 use karta hai, static fallback. Agar engineer phir sirf R4 par <code>ip pim rp-address 9.9.9.9 override</code> jode, to BSR wapas aane par bhi R4 9.9.9.9 use karta hai, jabki baaki har router learned RP rakhta hai. R4 ke receivers ab R4 ke padosiyon se alag RP ko join karte hain: classic silent fault.</p>

<h3>Show commands jo batate hain ki kaunsa source jeeta</h3>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 3.3.3.3 (?), v2
    <span class="hl">Info source: 1.1.1.1 (?), via bootstrap</span>, priority 5, holdtime 150
Group(s) 239.50.0.0/16
  RP 5.5.5.5 (?), v2
    Info source: 1.1.1.1 (?), via bootstrap, priority 200, holdtime 150

<span class="hl">Group(s): 224.0.0.0/4, Static
    RP: 8.8.8.8 (?)</span></pre>
<p>Static entry tab bhi print hoti hai jab learned mapping jeet rahi ho, isliye is list se yeh nateeja mat nikalo ki R4 8.8.8.8 use karta hai. Router se ek group ke baare mein poochho: <code>show ip mroute 239.20.1.1</code> mein print hua RP dekho.</p>

<h3>Chaar methods ki comparison</h3>
<table class="cmp"><tr><th></th><th>Static</th><th>Auto-RP</th><th>BSR</th><th>Anycast RP</th></tr>
<tr><td>Standard</td><td>n/a</td><td>Sirf Cisco</td><td>Open (PIMv2)</td><td>Open (MSDP)</td></tr>
<tr><td>Config effort</td><td>har router</td><td>kuch routers</td><td>kuch routers</td><td>2 RPs + MSDP</td></tr>
<tr><td>Redundancy</td><td>khud se nahi</td><td>dusra RP / agent</td><td>dusra C-RP / C-BSR</td><td>built in</td></tr>
<tr><td>Load sharing</td><td>ACL ranges se</td><td>ranges se</td><td>ranges aur hash se</td><td>topology se (nazdeeki RP)</td></tr>
<tr><td>Extra zaroorat</td><td>koi nahi</td><td>listener / dense</td><td>koi nahi</td><td>loopbacks par same address</td></tr>
</table>
<h4>Kaunsa chunein?</h4>
<ul>
<li>Chhota ya stable network, ek site: <b>static</b>. Padhna aur troubleshoot karna aasaan.</li>
<li>Sab Cisco aur aapko inherit hua hai: <b>Auto-RP</b>, listener aur do agents ke saath.</li>
<li>Mixed vendors ya load sharing chahiye: <b>BSR</b>.</li>
<li>Fast failover ke saath RP redundancy chahiye: <b>anycast RP</b> (anycast address ki taraf point karte static RP ke saath).</li>
</ul>
<p>Ek domain mein Auto-RP aur BSR ek saath chalane se bacho: kaam karta hai, lekin raat ke 2 baje team mein koi result predict nahi kar pata.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) <code>show ip pim rp mapping</code> ke <i>Static</i> block ko active RP padhna. (2) Test ke baad <code>override</code> chhod dena. (3) Auto-RP agent mein lowest priority jeetne ki ummeed; agent addresses compare karta hai, priorities nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo sawal ek hi group ke liye static RP, BSR RP aur Auto-RP RP list kare woh aam taur par order check karta hai: override static, phir learned (same range par Auto-RP BSR se pehle, longest range pehle), phir plain static.</p></div>

<div class="scn"><h4>Woh router jo disagree karta tha</h4><p>Naye RP ke weekend test ke baad Bharat Retail ke Hyderabad router par <code>ip pim rp-address 7.7.7.7 override</code> reh gaya. Monday ko Hyderabad ke store managers training channel nahi dekh paaye jabki baaki saare cities dekh rahe the. Hyderabad router par <code>show ip pim rp mapping</code> ke end mein <code>Static-Override</code> dikha. Engineer ne line hata di aur router phir learned RP use karne laga.</p><p><b>Seekh:</b> failing router par use hua RP ek working router ke saath same group ke liye compare karo; agar alag hai, to override dhoondho.</p></div>

<div class="iv"><p class="q">"Router ke paas ek hi group ke liye static RP aur BSR-learned RP hai. Kaunsa use hota hai?"</p><p>Strong answer: BSR-learned wala, kyunki plain static line sirf fallback hai. Agar static line mein <code>override</code> ho, to us router par static RP jeetta hai. Jodo ki aap <code>show ip pim rp mapping</code> aur <code>show ip mroute</code> mein dikhe RP se verify karoge, aur production mein bina wajah override nahi chhodoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: no-RP groups, static override, learned (longest range, Auto-RP BSR se pehle), plain static fallback.</li>
<li>Longest group range kisi bhi priority ya address compare hone se pehle jeetti hai.</li>
<li>Static entries tab bhi print hoti hain jab use nahi ho rahi hoti.</li>
<li>Chhote ke liye static, mixed vendors ke liye BSR, existing Cisco ke liye Auto-RP, redundancy ke liye anycast RP chuno.</li>
</ul></div>
`}};export{e as default};