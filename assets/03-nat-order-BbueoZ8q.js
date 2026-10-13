var e={id:`nat-order`,h:{en:`The three NAT sections and the order of evaluation`,hi:`Teen NAT sections aur evaluation ka order`},body:{en:`
<p>Imagine an airport immigration hall with three queues. The first queue is for diplomats, handled in exactly the order the officer lets them in. The second is the normal queue, and here the airport sorts people automatically: families with small children first, then everyone else, smallest groups first. The third queue is for anyone left over. An ASA looks at its NAT rules the same way, and <b>the first rule that matches wins</b>. Once you know the three queues, you can predict every translation.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three NAT sections">
<rect x="40" y="20" width="560" height="60" rx="8" fill="#fed7aa"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Section 1: manual NAT</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">in the order you configured (line numbers)</text>
<rect x="40" y="100" width="560" height="60" rx="8" fill="#bae6fd"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">Section 2: auto NAT (object NAT)</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">static before dynamic, fewest real IPs first</text>
<rect x="40" y="180" width="560" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="14">Section 3: manual NAT after-auto</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">catch-all rules, in configured order</text>
<line x1="20" y1="30" x2="20" y2="230" stroke="#64748b" stroke-width="2"/><polygon points="14,224 26,224 20,238" fill="#64748b"/>
<text x="625" y="135" text-anchor="middle" class="svg-accent" font-size="12">first</text><text x="625" y="152" text-anchor="middle" class="svg-accent" font-size="12">match</text>
</svg><p class="cap">The ASA walks down the sections and stops at the first matching rule.</p></div>

<h3>Section 1: manual NAT, your order</h3>
<p>Every twice NAT rule you type without the <code>after-auto</code> keyword lands in section 1. Rules are appended in the order you enter them. To place a rule above existing ones, give it a line number:</p>
<pre class="code"><span class="c">! Insert at the top of section 1</span>
nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</pre>
<p>Section 1 is where you put rules that must beat everything else, above all <b>identity NAT for VPN</b> (chapter 8). A precise rule here overrides a broad auto NAT rule in section 2.</p>

<h3>Section 2: auto NAT, sorted by the ASA</h3>
<p>You cannot choose the order of auto NAT rules. The ASA sorts them with fixed rules:</p>
<ol>
<li><b>Static</b> rules come before <b>dynamic</b> rules.</li>
<li>Within each group, the rule with the <b>fewest real addresses</b> comes first (a host before a /28, a /28 before a /24).</li>
<li>If the size is equal, the <b>lower IP address</b> comes first.</li>
<li>If still equal, the object <b>name</b> decides, alphabetically.</li>
</ol>
<p>This sorting is why the most specific translation naturally wins. WEB (10.0.2.10) sits inside DMZ-NET (10.0.2.0/24), which has dynamic PAT. Because WEB's rule is static and covers one address, it is always checked first, so the server keeps 203.0.113.3 in both directions.</p>

<h3>Section 3: manual NAT after auto</h3>
<p>Add <code>after-auto</code> to a manual rule and it drops below all auto NAT rules. It is ideal for broad defaults that should apply only when nothing more specific matched:</p>
<pre class="code"><span class="c">! Catch-all PAT for any inside network, evaluated last</span>
nat (inside,outside) after-auto source dynamic any interface</pre>

<h3>Reading the order in show nat</h3>
<p>With the lab objects WEB, JUMP (added in chapter 6), INSIDE-NET and DMZ-NET, the table looks like this:</p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.3</span>
    translate_hits = 4, untranslate_hits = 31
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
3 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 212, untranslate_hits = 9
<span class="hl">4 (dmz) to (outside) source dynamic DMZ-NET interface</span>
    translate_hits = 18, untranslate_hits = 0</pre>
<p>There is no section 1 or 3 here, so only section 2 is printed. Notice the order: two static host rules first (10.0.2.10 before 10.0.2.20, lower IP), then two dynamic /24 rules (10.0.1.0 before 10.0.2.0, lower IP).</p>

<div class="eg"><p><b>Worked example.</b> A packet from 10.0.2.10 to 8.8.8.8 arrives on dmz. Section 1 is empty. In section 2 the first rule, WEB static, matches the source 10.0.2.10, so the packet leaves as 203.0.113.3. The DMZ-NET PAT rule is never reached for this host. A packet from 10.0.2.30 does not match WEB or JUMP and falls to rule 4, leaving as 203.0.113.2 with a new port.</p></div>

<h3>Why order matters for troubleshooting</h3>
<p>Most "NAT is ignored" tickets are really "another rule matched first". Typical culprits: a broad section 1 rule written as <code>source dynamic any interface</code> that catches VPN traffic before the identity rule below it; or a manual static rule for a subnet placed above a host rule you expected to win. <code>show nat</code> numbering and <code>packet-tracer</code> (which prints the matching rule in its NAT phase) reveal the winner immediately.</p>

<div class="warn"><p><b>Common mistake.</b> Adding a broad manual rule without <code>after-auto</code>. It lands in section 1 and silently overrides every static server translation below it, so published servers start leaving through the interface PAT address.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which is evaluated first: an auto NAT static for a /24 or an auto NAT dynamic for a single host?" The static /24, because static beats dynamic before size is considered. Size only breaks ties inside the static group or inside the dynamic group.</p></div>

<div class="scn"><h4>The VPN that died after a "cleanup"</h4><p>An engineer tidied the NAT configuration by replacing several auto NAT PAT rules with one manual rule, <code>nat (inside,outside) source dynamic any interface</code>. The next morning the branch VPN was down. <code>show nat</code> showed his new rule as section 1 line 1, above the identity NAT for the branch subnets. Branch-bound packets were now PATed to 203.0.113.2 and no longer matched the crypto ACL. Re-entering the rule with <code>after-auto</code> restored the VPN.</p><p><b>Lesson:</b> broad rules belong in section 3; exceptions belong at the top of section 1.</p></div>

<div class="iv"><p class="q">"How does the ASA decide which NAT rule applies?"</p><p>Describe the three sections: section 1 manual NAT in configured order, section 2 auto NAT sorted static before dynamic then fewest real IPs, lower IP and name, and section 3 manual after-auto. First match wins. Add how you verify it: <code>show nat</code> numbering and the rule printed in the packet-tracer NAT phase.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three sections, first match wins: manual, auto, manual after-auto.</li>
<li>Section 1 follows your order; use a line number to insert at the top.</li>
<li>Section 2 is sorted: static first, then fewest real IPs, lower IP, then name.</li>
<li>Put catch-all rules in section 3 with <code>after-auto</code>; put exemptions at the top of section 1.</li>
<li><code>show nat</code> prints rules in evaluation order with hit counters.</li>
</ul></div>
`,hi:`
<p>Ek airport ka immigration hall socho jahan teen queues hain. Pehli queue diplomats ki hai, bilkul usi order mein handle hoti hai jis mein officer unhe andar aane deta hai. Doosri normal queue hai, aur yahan airport logon ko automatically sort karta hai: pehle chhote bachchon wali families, phir baaki sab, chhote groups pehle. Teesri queue bache hue logon ke liye hai. ASA apni NAT rules ko bilkul isi tarah dekhta hai, aur <b>jo pehli rule match karti hai woh jeetti hai</b>. Teen queues samajh gaye to aap har translation predict kar sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Three NAT sections">
<rect x="40" y="20" width="560" height="60" rx="8" fill="#fed7aa"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Section 1: manual NAT</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">jis order mein configure kiya (line numbers)</text>
<rect x="40" y="100" width="560" height="60" rx="8" fill="#bae6fd"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="14">Section 2: auto NAT (object NAT)</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">dynamic se pehle static, kam real IPs pehle</text>
<rect x="40" y="180" width="560" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="14">Section 3: manual NAT after-auto</text><text x="320" y="224" text-anchor="middle" class="svg-muted" font-size="12">catch-all rules, configure kiye order mein</text>
<line x1="20" y1="30" x2="20" y2="230" stroke="#64748b" stroke-width="2"/><polygon points="14,224 26,224 20,238" fill="#64748b"/>
<text x="625" y="135" text-anchor="middle" class="svg-accent" font-size="12">pehla</text><text x="625" y="152" text-anchor="middle" class="svg-accent" font-size="12">match</text>
</svg><p class="cap">ASA sections mein neeche chalta hai aur pehli matching rule par ruk jaata hai.</p></div>

<h3>Section 1: manual NAT, aapka order</h3>
<p>Har twice NAT rule jo aap <code>after-auto</code> keyword ke bina type karte ho, section 1 mein jaati hai. Rules usi order mein judti hain jis mein aap enter karte ho. Kisi rule ko existing rules ke upar rakhne ke liye use line number do:</p>
<pre class="code"><span class="c">! Section 1 ke top par insert karo</span>
nat (inside,outside) 1 source static INSIDE-NET INSIDE-NET destination static BRANCH-NET BRANCH-NET no-proxy-arp route-lookup</pre>
<p>Section 1 woh jagah hai jahan aap woh rules rakhte ho jinhe sabse jeetna hai, sabse upar <b>VPN ke liye identity NAT</b> (chapter 8). Yahan ki precise rule section 2 ki broad auto NAT rule ko override karti hai.</p>

<h3>Section 2: auto NAT, ASA sort karta hai</h3>
<p>Aap auto NAT rules ka order choose nahi kar sakte. ASA fixed rules se unhe sort karta hai:</p>
<ol>
<li><b>Static</b> rules <b>dynamic</b> rules se pehle aati hain.</li>
<li>Har group ke andar, <b>sabse kam real addresses</b> wali rule pehle aati hai (/28 se pehle host, /24 se pehle /28).</li>
<li>Size barabar ho to <b>kam IP address</b> pehle aata hai.</li>
<li>Phir bhi barabar ho to object ka <b>naam</b> alphabetically decide karta hai.</li>
</ol>
<p>Isi sorting ki wajah se sabse specific translation naturally jeetti hai. WEB (10.0.2.10) DMZ-NET (10.0.2.0/24) ke andar hai, jiska dynamic PAT hai. Kyunki WEB ki rule static hai aur ek address cover karti hai, woh hamesha pehle check hoti hai, isliye server dono directions mein 203.0.113.3 rakhta hai.</p>

<h3>Section 3: auto ke baad manual NAT</h3>
<p>Manual rule mein <code>after-auto</code> jodo aur woh saari auto NAT rules ke neeche chali jaati hai. Yeh broad defaults ke liye ideal hai jo tabhi apply hon jab kuch aur specific match na hua ho:</p>
<pre class="code"><span class="c">! Kisi bhi inside network ke liye catch-all PAT, sabse aakhir mein evaluate</span>
nat (inside,outside) after-auto source dynamic any interface</pre>

<h3>show nat mein order padhna</h3>
<p>Lab objects WEB, JUMP (chapter 6 mein add hota hai), INSIDE-NET aur DMZ-NET ke saath table aisi dikhti hai:</p>
<pre class="out">NK-ASA# show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.3</span>
    translate_hits = 4, untranslate_hits = 31
2 (dmz) to (outside) source static JUMP interface  service tcp ssh 2222
    translate_hits = 0, untranslate_hits = 6
3 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 212, untranslate_hits = 9
<span class="hl">4 (dmz) to (outside) source dynamic DMZ-NET interface</span>
    translate_hits = 18, untranslate_hits = 0</pre>
<p>Yahan koi section 1 ya 3 nahi hai, isliye sirf section 2 print hota hai. Order dekho: pehle do static host rules (10.0.2.10 pehle, phir 10.0.2.20, kam IP pehle), phir do dynamic /24 rules (10.0.1.0 pehle, phir 10.0.2.0, kam IP pehle).</p>

<div class="eg"><p><b>Worked example.</b> 10.0.2.10 se 8.8.8.8 ka packet dmz par aata hai. Section 1 khaali hai. Section 2 mein pehli rule, WEB static, source 10.0.2.10 match karti hai, isliye packet 203.0.113.3 ban kar nikalta hai. Is host ke liye DMZ-NET PAT rule tak kabhi pahuncha hi nahi jaata. 10.0.2.30 ka packet WEB ya JUMP match nahi karta aur rule 4 par girta hai, naye port ke saath 203.0.113.2 ban kar nikalta hai.</p></div>

<h3>Troubleshooting ke liye order kyun matter karta hai</h3>
<p>Zyada tar "NAT ignore ho raha hai" tickets asal mein "koi aur rule pehle match ho gayi" hote hain. Typical culprits: section 1 ki ek broad rule jo <code>source dynamic any interface</code> likhi gayi aur neeche wali identity rule se pehle VPN traffic pakad leti hai; ya subnet ki manual static rule jo us host rule ke upar rakhi gayi jise aap jeetne ki ummeed kar rahe the. <code>show nat</code> ki numbering aur <code>packet-tracer</code> (jo apne NAT phase mein matching rule print karta hai) winner turant dikha dete hain.</p>

<div class="warn"><p><b>Common galti.</b> <code>after-auto</code> ke bina broad manual rule add karna. Woh section 1 mein jaati hai aur chupchaap neeche ke har static server translation ko override kar deti hai, to published servers interface PAT address se bahar jaane lagte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Pehle kaun evaluate hota hai: /24 ke liye auto NAT static ya single host ke liye auto NAT dynamic?" /24 static, kyunki size dekhne se pehle hi static dynamic ko harata hai. Size sirf static group ya dynamic group ke andar ties todta hai.</p></div>

<div class="scn"><h4>"Cleanup" ke baad mari VPN</h4><p>Ek engineer ne kai auto NAT PAT rules ko ek manual rule, <code>nat (inside,outside) source dynamic any interface</code>, se replace karke NAT configuration saaf ki. Agli subah branch VPN down tha. <code>show nat</code> ne uski nayi rule ko section 1 line 1 par dikhaya, branch subnets ki identity NAT ke upar. Branch ki taraf jaane wale packets ab 203.0.113.2 par PAT ho rahe the aur crypto ACL match nahi kar rahe the. Rule ko <code>after-auto</code> ke saath dobara enter karne se VPN wapas aaya.</p><p><b>Seekh:</b> broad rules section 3 mein jaati hain; exceptions section 1 ke top par.</p></div>

<div class="iv"><p class="q">"ASA kaise decide karta hai ki kaunsi NAT rule apply hogi?"</p><p>Teen sections batao: section 1 manual NAT configure kiye order mein, section 2 auto NAT sorted, dynamic se pehle static phir kam real IPs, kam IP aur naam, aur section 3 manual after-auto. Pehla match jeetta hai. Jodo ki aap kaise verify karte ho: <code>show nat</code> numbering aur packet-tracer NAT phase mein print hui rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen sections, pehla match jeetta hai: manual, auto, manual after-auto.</li>
<li>Section 1 aapka order follow karta hai; top par insert karne ke liye line number use karo.</li>
<li>Section 2 sorted hai: pehle static, phir kam real IPs, kam IP, phir naam.</li>
<li>Catch-all rules <code>after-auto</code> ke saath section 3 mein rakho; exemptions section 1 ke top par.</li>
<li><code>show nat</code> rules ko evaluation order mein hit counters ke saath print karta hai.</li>
</ul></div>
`}};export{e as default};