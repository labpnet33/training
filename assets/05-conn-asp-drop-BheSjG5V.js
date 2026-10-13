var e={id:`conn-asp-drop`,h:{en:`Live state: show conn, xlate, nat, hit counts and show asp drop`,hi:`Live state: show conn, xlate, nat, hit counts aur show asp drop`},body:{en:`
<p>A hospital ward has two kinds of records: the list of patients in beds right now, and the register of everyone turned away at the door with the reason. A firewall keeps both. The <b>connection and translation tables</b> are the patients in beds. The <b>accelerated security path (ASP) drop counters</b> are the turned-away register. Together with rule hit counts and Snort statistics, they tell you what the box is doing at this moment, without any simulation.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Live state tools">
<rect x="10" y="20" width="200" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">show conn / xlate</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">patients in beds</text>
<rect x="220" y="20" width="200" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">show nat / acc-control</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">hit counters</text>
<rect x="430" y="20" width="200" height="56" rx="8" fill="#fed7aa"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">show asp drop</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">turned away, with reason</text>
<rect x="120" y="100" width="400" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">show snort statistics</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">pass, block, fast-forward, bypass</text>
</svg><p class="cap">Four views of live state: current flows, how often rules and translations match, what LINA dropped, and what Snort decided.</p></div>

<h3>show conn: who is connected now</h3>
<pre class="out">&gt; show conn
3 in use, 41 most used
Inspect Snort:
        preserve-connection: 2 enabled, 0 in effect, 4 most enabled, 0 most in effect

<span class="hl">TCP outside  198.51.100.10:40112 dmz  10.0.2.10:443, idle 0:00:02, bytes 18342, flags UIOB N1</span>
TCP inside  10.0.1.10:51544 outside  8.8.8.8:443, idle 0:00:11, bytes 4210, flags UIO N1
UDP inside  10.0.1.10:53120 outside  8.8.8.8:53, idle 0:00:01, bytes 96, flags - N1</pre>
<p>Every entry shows the interfaces, the <b>real</b> addresses (the partner's flow is to 10.0.2.10 on dmz, not to 203.0.113.3), idle time, bytes and flags. Useful flags: <b>U</b> up, <b>I</b> inbound data, <b>O</b> outbound data, <b>B</b> initial SYN came from the outside, and on Threat Defense <b>N</b> = inspected by Snort (N1 means preserve-connection is enabled for it, so the flow survives a Snort restart). A flow with bytes growing in both directions (I and O) is healthy. Filter with <code>show conn address 10.0.2.10</code> or <code>show conn port 443</code>; add <code>detail</code> for timers and more flags.</p>

<h3>show xlate and show nat: is the translation right?</h3>
<pre class="out">&gt; show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
<span class="hl">    translate_hits = 0, untranslate_hits = 0</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 412, untranslate_hits = 18
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 3, untranslate_hits = 0

&gt; show xlate
2 in use, 9 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.0.2.10 to outside:203.0.113.5
    flags s idle 0:41:07 timeout 0:00:00
TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:11 timeout 0:00:30</pre>
<p>This is the lab's first fault in plain sight: WEB is mapped to <b>203.0.113.5</b>, not 203.0.113.3, and <b>untranslate_hits = 0</b> because nobody ever sends to .5. <code>untranslate_hits</code> count packets arriving for the mapped address (inbound), <code>translate_hits</code> count connections the real host starts (outbound). The NAT sections matter too: Section 1 is manual NAT placed before auto NAT, Section 2 is auto NAT, Section 3 is manual NAT after auto NAT. The first match wins, top to bottom.</p>

<h3>Rule hit counts: is my rule ever matched?</h3>
<pre class="out">&gt; show access-control-config
...
-----------------[ Rule: Portal-In ]-----------------
    Action                : Allow
    Source Zones          : OUTSIDE
    Destination Zones     : DMZ
<span class="hl">    Destination Networks  : 203.0.113.3</span>
    Destination Ports     : HTTPS (protocol 6, port 443)
    Logging Configuration
    DC                    : Enabled
      Beginning           : Disabled
      End                 : Enabled
<span class="hl">    Rule Hits             : 0</span></pre>
<p>Here is the second fault: Portal-In's destination is the <b>mapped</b> address 203.0.113.3. Because UN-NAT happens before the access list, the rule must use the real server (object WEB, 10.0.2.10). Zero hits confirm it never matches. <code>show access-control-config</code> shows only what is <b>deployed</b>, so it is also how you prove a rule never reached the device.</p>

<h3>show asp drop: why LINA threw packets away</h3>
<pre class="out">&gt; show asp drop

Frame drop:
  No route to host (no-route)                                                  12
<span class="hl">  Flow is denied by configured rule (acl-drop)                                 87</span>
  First TCP packet not SYN (tcp-not-syn)                                       14
  Snort requested to drop the frame (snort-drop)                                9
  Reverse-path verify failed (rpf-violated)                                     3

Last clearing: Never</pre>
<p>The counters are global and cumulative, so the trick is <b>clear, reproduce, look</b>: <code>clear asp drop</code>, ask the partner to retry, run <code>show asp drop</code> again. The counter that jumped is your clue. Common reasons: <b>acl-drop</b> (policy, including the default action), <b>no-route</b>, <b>tcp-not-syn</b> (often asymmetric routing), <b>rpf-violated</b> (uRPF), <b>nat-no-xlate-to-pat-pool</b>, and <b>snort-drop</b> or <b>snort-block</b> when Snort's verdict was drop.</p>

<h3>show snort statistics: is Snort the one saying no?</h3>
<pre class="out">&gt; show snort statistics
Packet Counters:
  Passed Packets                                         1205440
  Blocked Packets                                            382
  Injected Packets                                            14
  Packets bypassed (Snort Down)                                0
  Packets bypassed (Snort Busy)                                0
Flow Counters:
  Fast-Forwarded Flows                                      8812
  Blacklisted Flows                                           37</pre>
<p>Blocked Packets and Blacklisted Flows rising while you reproduce points at Snort verdicts (intrusion, file or Security Intelligence). Fast-Forwarded Flows count trusted or fastpathed flows. Non-zero bypass counters mean Snort was down or busy and fail-open let traffic through uninspected.</p>

<div class="eg"><p><b>Worked example.</b> In the broken lab: <code>show nat</code> shows WEB to 203.0.113.5 with 0 untranslate_hits; <code>show access-control-config</code> shows Portal-In with destination 203.0.113.3 and 0 hits; after <code>clear asp drop</code> and three partner SYNs, acl-drop rises by 3. Three commands, two faults found, zero guessing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading asp drop totals without clearing first, so old drops look like today's problem. Expecting <code>show conn</code> to show the mapped address for an inbound static flow (it shows real addresses). Forgetting that clearing asp drop or connections is a change: do it deliberately, and never <code>clear conn</code> without a filter on a production firewall.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>N</b> flag in <code>show conn</code> = inspected by Snort. <code>untranslate_hits</code> = inbound to the mapped address. <code>show access-control-config</code> = the deployed policy with hit counts. snort-drop in asp drop = Snort's verdict, not a LINA rule.</p></div>

<div class="scn"><h4>The firewall that dropped half a conversation</h4><p>Users reported that an internal application froze after the first click. <code>clear asp drop</code>, reproduce, <code>show asp drop</code>: tcp-not-syn jumped by 40. The connection's SYN had gone out through a different path, so the firewall saw only the return traffic and dropped it as "first packet not SYN". A new static route on a core switch had created asymmetric routing. Fixing the route fixed the app.</p><p><b>Lesson:</b> asp drop reasons translate directly into root causes; tcp-not-syn almost always means asymmetry.</p></div>

<div class="iv"><p class="q">"show asp drop shows thousands of acl-drops. Is that a problem?"</p><p>Not by itself: blocking unwanted traffic is the firewall's job, and the counter is cumulative. The right method is clear, reproduce the specific flow, and look again; then confirm with packet-tracer or a capture with trace which rule-id dropped it. Mention snort-drop as the counter that points at Snort instead of LINA.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show conn</code> shows real addresses and flags; N = inspected by Snort.</li>
<li><code>show nat</code> hit counters prove whether a translation is ever used.</li>
<li><code>show access-control-config</code> shows deployed rules and Rule Hits.</li>
<li><code>show asp drop</code>: clear, reproduce, look; the counter that moves is your clue.</li>
<li><code>show snort statistics</code> tells you whether Snort is blocking, fast-forwarding or being bypassed.</li>
</ul></div>
`,hi:`
<p>Hospital ward ke do tarah ke records hote hain: abhi beds par kaunse patients hain uski list, aur darwaze se lautaye gaye har insaan ka register reason ke saath. Firewall dono rakhta hai. <b>Connection aur translation tables</b> beds wale patients hain. <b>Accelerated security path (ASP) drop counters</b> lautaye gaye logon ka register hai. Rule hit counts aur Snort statistics ke saath milkar yeh batate hain ki box is waqt kya kar raha hai, bina kisi simulation ke.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Live state ke tools">
<rect x="10" y="20" width="200" height="56" rx="8" fill="#bbf7d0"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">show conn / xlate</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">beds wale patients</text>
<rect x="220" y="20" width="200" height="56" rx="8" fill="#bae6fd"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">show nat / acc-control</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">hit counters</text>
<rect x="430" y="20" width="200" height="56" rx="8" fill="#fed7aa"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">show asp drop</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">lautaye gaye, reason ke saath</text>
<rect x="120" y="100" width="400" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">show snort statistics</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">pass, block, fast-forward, bypass</text>
</svg><p class="cap">Live state ke chaar views: current flows, rules aur translations kitni baar match hote hain, LINA ne kya drop kiya, aur Snort ne kya decide kiya.</p></div>

<h3>show conn: abhi kaun connected hai</h3>
<pre class="out">&gt; show conn
3 in use, 41 most used
Inspect Snort:
        preserve-connection: 2 enabled, 0 in effect, 4 most enabled, 0 most in effect

<span class="hl">TCP outside  198.51.100.10:40112 dmz  10.0.2.10:443, idle 0:00:02, bytes 18342, flags UIOB N1</span>
TCP inside  10.0.1.10:51544 outside  8.8.8.8:443, idle 0:00:11, bytes 4210, flags UIO N1
UDP inside  10.0.1.10:53120 outside  8.8.8.8:53, idle 0:00:01, bytes 96, flags - N1</pre>
<p>Har entry interfaces, <b>real</b> addresses (partner ka flow dmz par 10.0.2.10 ki taraf hai, 203.0.113.3 nahi), idle time, bytes aur flags dikhati hai. Kaam ke flags: <b>U</b> up, <b>I</b> inbound data, <b>O</b> outbound data, <b>B</b> initial SYN outside se aaya, aur Threat Defense par <b>N</b> = Snort ne inspect kiya (N1 ka matlab us par preserve-connection enabled hai, to flow Snort restart jhel leta hai). Jis flow ke bytes dono direction (I aur O) mein badh rahe hon woh healthy hai. <code>show conn address 10.0.2.10</code> ya <code>show conn port 443</code> se filter karo; timers aur zyada flags ke liye <code>detail</code> jodo.</p>

<h3>show xlate aur show nat: kya translation sahi hai?</h3>
<pre class="out">&gt; show nat
Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
<span class="hl">    translate_hits = 0, untranslate_hits = 0</span>
2 (inside) to (outside) source dynamic INSIDE-NET interface
    translate_hits = 412, untranslate_hits = 18
3 (dmz) to (outside) source dynamic DMZ-NET interface
    translate_hits = 3, untranslate_hits = 0

&gt; show xlate
2 in use, 9 most used
Flags: D - DNS, e - extended, I - identity, i - dynamic, r - portmap,
       s - static, T - twice, N - net-to-net
NAT from dmz:10.0.2.10 to outside:203.0.113.5
    flags s idle 0:41:07 timeout 0:00:00
TCP PAT from inside:10.0.1.10/51544 to outside:203.0.113.2/51544 flags ri idle 0:00:11 timeout 0:00:30</pre>
<p>Lab ka pehla fault saaf dikh raha hai: WEB <b>203.0.113.5</b> par mapped hai, 203.0.113.3 par nahi, aur <b>untranslate_hits = 0</b> kyunki .5 par koi bhejta hi nahi. <code>untranslate_hits</code> mapped address ke liye aane wale packets ginte hain (inbound), <code>translate_hits</code> real host ke shuru kiye connections ginte hain (outbound). NAT sections bhi matter karte hain: Section 1 auto NAT se pehle rakha manual NAT hai, Section 2 auto NAT hai, Section 3 auto NAT ke baad wala manual NAT hai. Upar se neeche, pehla match jeetta hai.</p>

<h3>Rule hit counts: kya meri rule kabhi match hoti hai?</h3>
<pre class="out">&gt; show access-control-config
...
-----------------[ Rule: Portal-In ]-----------------
    Action                : Allow
    Source Zones          : OUTSIDE
    Destination Zones     : DMZ
<span class="hl">    Destination Networks  : 203.0.113.3</span>
    Destination Ports     : HTTPS (protocol 6, port 443)
    Logging Configuration
    DC                    : Enabled
      Beginning           : Disabled
      End                 : Enabled
<span class="hl">    Rule Hits             : 0</span></pre>
<p>Yeh doosra fault hai: Portal-In ka destination <b>mapped</b> address 203.0.113.3 hai. Kyunki UN-NAT access list se pehle hota hai, rule ko real server (object WEB, 10.0.2.10) use karna chahiye. Zero hits confirm karte hain ki yeh kabhi match nahi hoti. <code>show access-control-config</code> sirf <b>deployed</b> cheez dikhata hai, isliye isi se aap prove karte ho ki koi rule kabhi device tak pahunchi hi nahi.</p>

<h3>show asp drop: LINA ne packets kyun phenke</h3>
<pre class="out">&gt; show asp drop

Frame drop:
  No route to host (no-route)                                                  12
<span class="hl">  Flow is denied by configured rule (acl-drop)                                 87</span>
  First TCP packet not SYN (tcp-not-syn)                                       14
  Snort requested to drop the frame (snort-drop)                                9
  Reverse-path verify failed (rpf-violated)                                     3

Last clearing: Never</pre>
<p>Counters global aur cumulative hain, isliye trick hai <b>clear, reproduce, dekho</b>: <code>clear asp drop</code>, partner se retry karwao, phir se <code>show asp drop</code> chalao. Jo counter uchhla, wahi aapka clue hai. Common reasons: <b>acl-drop</b> (policy, default action samet), <b>no-route</b>, <b>tcp-not-syn</b> (aksar asymmetric routing), <b>rpf-violated</b> (uRPF), <b>nat-no-xlate-to-pat-pool</b>, aur <b>snort-drop</b> ya <b>snort-block</b> jab Snort ka verdict drop tha.</p>

<h3>show snort statistics: kya Snort mana kar raha hai?</h3>
<pre class="out">&gt; show snort statistics
Packet Counters:
  Passed Packets                                         1205440
  Blocked Packets                                            382
  Injected Packets                                            14
  Packets bypassed (Snort Down)                                0
  Packets bypassed (Snort Busy)                                0
Flow Counters:
  Fast-Forwarded Flows                                      8812
  Blacklisted Flows                                           37</pre>
<p>Reproduce karte waqt Blocked Packets aur Blacklisted Flows badhein to yeh Snort verdicts (intrusion, file ya Security Intelligence) ki taraf ishaara hai. Fast-Forwarded Flows trusted ya fastpathed flows ginte hain. Non-zero bypass counters ka matlab Snort down ya busy tha aur fail-open ne traffic bina inspection jaane diya.</p>

<div class="eg"><p><b>Worked example.</b> Tooti lab mein: <code>show nat</code> WEB ko 203.0.113.5 par 0 untranslate_hits ke saath dikhata hai; <code>show access-control-config</code> Portal-In ko destination 203.0.113.3 aur 0 hits ke saath dikhata hai; <code>clear asp drop</code> aur partner ke teen SYN ke baad acl-drop 3 se badhta hai. Teen commands, do faults mile, zero guessing.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Pehle clear kiye bina asp drop totals padhna, jisse purane drops aaj ki problem lagte hain. Inbound static flow ke liye <code>show conn</code> se mapped address dikhne ki ummeed karna (woh real addresses dikhata hai). Yeh bhoolna ki asp drop ya connections clear karna bhi ek change hai: soch-samajhkar karo, aur production firewall par bina filter ke kabhi <code>clear conn</code> mat karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show conn</code> mein <b>N</b> flag = Snort ne inspect kiya. <code>untranslate_hits</code> = mapped address par inbound. <code>show access-control-config</code> = hit counts ke saath deployed policy. asp drop mein snort-drop = Snort ka verdict, LINA rule nahi.</p></div>

<div class="scn"><h4>Woh firewall jo aadhi baatcheet drop karta tha</h4><p>Users ne report kiya ki ek internal application pehle click ke baad freeze ho jaati thi. <code>clear asp drop</code>, reproduce, <code>show asp drop</code>: tcp-not-syn 40 se uchhla. Connection ka SYN doosre path se gaya tha, isliye firewall ne sirf return traffic dekha aur use "first packet not SYN" maankar drop kiya. Core switch par ek naye static route ne asymmetric routing bana di thi. Route theek kiya, app theek ho gayi.</p><p><b>Seekh:</b> asp drop reasons seedhe root causes mein translate hote hain; tcp-not-syn ka matlab lagbhag hamesha asymmetry hai.</p></div>

<div class="iv"><p class="q">"show asp drop hazaaron acl-drops dikhata hai. Kya yeh problem hai?"</p><p>Akele mein nahi: unwanted traffic block karna firewall ka kaam hai, aur counter cumulative hai. Sahi method hai clear karo, specific flow reproduce karo, aur dobara dekho; phir packet-tracer ya trace wale capture se confirm karo ki kis rule-id ne drop kiya. snort-drop ko mention karo, woh counter jo LINA ki jagah Snort ki taraf ishaara karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show conn</code> real addresses aur flags dikhata hai; N = Snort ne inspect kiya.</li>
<li><code>show nat</code> ke hit counters prove karte hain ki translation kabhi use hota hai ya nahi.</li>
<li><code>show access-control-config</code> deployed rules aur Rule Hits dikhata hai.</li>
<li><code>show asp drop</code>: clear, reproduce, dekho; jo counter hile wahi clue hai.</li>
<li><code>show snort statistics</code> batata hai ki Snort block, fast-forward kar raha hai ya bypass ho raha hai.</li>
</ul></div>
`}};export{e as default};