var e={id:`session-table`,h:{en:`The session table: list, filter, read and clear`,hi:`Session table: list, filter, padhna aur clear karna`},body:{en:`
<p>Every allowed flow becomes a <b>session</b> in the FortiGate's session table. The session records which policy created it, how it is translated, how many bytes crossed, and how long it will live. Reading it answers: "Which policy handled this? What source address did the server see? Is traffic flowing right now?"</p>

<h3>Four commands</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>get system session list</code></td><td>One-line summary of each session</td></tr>
<tr><td><code>diagnose sys session filter ...</code></td><td>Choose which sessions the next commands apply to</td></tr>
<tr><td><code>diagnose sys session list</code></td><td>Full detail of the filtered sessions</td></tr>
<tr><td><code>diagnose sys session clear</code></td><td>Delete the filtered sessions</td></tr></table>
<p>Also <code>diagnose sys session stat</code> gives totals. A busy firewall holds thousands of sessions, so <b>always filter first</b>: <code>diagnose sys session filter clear</code> to start from nothing, then for example <code>diagnose sys session filter dst 8.8.8.8</code>. Other filter keys include <code>src</code>, <code>sport</code>, <code>dport</code>, <code>proto</code> and <code>policy</code>.</p>

<h3>The one-line view</h3>
<pre class="out">get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
icmp    42     10.0.1.10:19499       -                     10.0.2.10:8           -
icmp    48     10.0.1.10:19499       203.0.113.2:40001     8.8.8.8:8             -</pre>
<p>Two sessions from the same PC: one to the DMZ server with no source NAT, one to the Internet with source NAT to <b>203.0.113.2:40001</b>. EXPIRE counts down in seconds. For ICMP the "port" is the ICMP type or id; for TCP and UDP it is the real port.</p>

<h3>The full view, field by field</h3>
<p>Filtered to destination 8.8.8.8 after a ping from PC1:</p>
<pre class="out">diagnose sys session filter dst 8.8.8.8
diagnose sys session list
session info: <span class="hl">proto=1</span> proto_state=00 duration=9 expire=51 timeout=0 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
...
statistic(bytes/packets/allow_err): <span class="hl">org=520/5/1 reply=520/5/1</span> tuples=2
...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post <span class="hl">dev=4-&gt;3/3-&gt;4</span> gwy=203.0.113.1/10.0.1.10
hook=post dir=org <span class="hl">act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat 8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
serial=000025d2 tos=ff/ff app_list=0 app=0 url_cat=0
total session 1</pre>
<table class="cmp"><tr><th>Field</th><th>Meaning</th></tr>
<tr><td><code>proto=1</code></td><td>IP protocol number: 1 ICMP, 6 TCP, 17 UDP</td></tr>
<tr><td><code>expire=51</code></td><td>Seconds until the session is removed if idle</td></tr>
<tr><td><code>org=520/5/1 reply=520/5/1</code></td><td>Bytes, packets, and allow errors in each direction: traffic flowed both ways</td></tr>
<tr><td><code>dev=4-&gt;3/3-&gt;4</code></td><td>Interface indexes (ingress to egress, and back); <code>diagnose ip arp list</code> shows index 4 is port2 and index 3 is port1</td></tr>
<tr><td><code>act=snat ... (203.0.113.2:40001)</code></td><td>Source NAT applied: the server sees 203.0.113.2 port 40001</td></tr>
<tr><td><code>policy_id=1</code></td><td>The policy that created the session</td></tr>
<tr><td><code>app_list, app, url_cat</code></td><td>Application and URL category bound to the session; zero when no profile identified one</td></tr></table>
<p>The reply hook shows the translation reversed: traffic back to 203.0.113.2 port 40001 is translated to 10.0.1.10 port 19499.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Session tuples">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Original</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">10.0.1.10 to 8.8.8.8</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">NAT</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">source 203.0.113.2:40001</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Reply</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">8.8.8.8 to 203.0.113.2</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Back</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">translated to 10.0.1.10</text>
</svg><p class="cap">A session stores both directions and the translation.</p></div>

<h3>A TCP session</h3>
<p>For the web session to the DMZ server (policy 2, no NAT) the table shows a normal TCP life: <code>proto=6</code>, <code>proto_state=01</code> (established), <code>expire=3594</code> of a one-hour timeout, hooks with <code>act=noop</code> (no translation), and <code>policy_id=2</code>. A one-line view says <code>tcp 3591 10.0.1.10:57160 - 10.0.2.10:80 -</code>.</p>

<h3>Clearing sessions</h3>
<p>Existing sessions keep the policy that created them. After a policy change, flows already in the table continue with the old rules until they expire. Use <code>diagnose sys session clear</code> with a filter to delete only what you intend, then run <code>diagnose sys session filter clear</code> so the next engineer sees the whole table.</p>

<div class="eg"><p><b>Worked example.</b> Lab task: "Which policy created the session to 8.8.8.8?" You run <code>diagnose sys session filter clear</code>, <code>diagnose sys session filter dst 8.8.8.8</code>, <code>diagnose sys session list</code> and read <code>policy_id=1</code>. Then <code>diagnose sys session clear</code> removes it and <code>diagnose sys session filter clear</code> resets the filter.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running <code>diagnose sys session clear</code> with no filter on a production unit. It drops every session, including live voice calls and VPN traffic. Always set a precise filter and list first to see what will be deleted.</p></div>
<div class="exam"><p><b>Exam trap.</b> The filter must be set before <code>session list</code> or <code>session clear</code> applies to it. The session carries the policy ID and the NAT actions; changes to a policy do not alter existing sessions until they end or are cleared.</p></div>

<div class="scn"><h4>The session that survived the policy change</h4><p>A policy was changed to block a game server, but a player stayed connected. The engineer listed the sessions filtered on the server address, found a long-running session still pointing at the old policy ID, cleared only that session, and the next connection attempt was denied and logged.</p><p><b>Lesson:</b> a policy change is not retroactive for open sessions.</p></div>

<div class="iv"><p class="q">"How can you see which NAT address a client used and which policy allowed it?"</p><p>In the session table: filter on the destination or source, run the full session list, and read <code>policy_id</code> and the <code>act=snat</code> line, which shows the translated source address and port. <code>get system session list</code> gives the same translation in one line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Always filter first, then list; clear deletes only the filtered sessions.</li>
<li>Read policy_id, act=snat/dnat, byte counters in both directions and expire.</li>
<li>get system session list gives a one-line view with source NAT.</li>
<li>Existing sessions keep their old policy until cleared or expired.</li>
<li>Reset the filter when finished.</li>
</ul></div>
`,hi:`
<p>Har allowed flow FortiGate ke session table mein <b>session</b> ban jaata hai. Session record karta hai ki kaunsi policy ne banaya, kaise translate hua, kitne bytes guzre, aur kitni der jeeyega. Ise padhne se in sawaalon ka jawab milta hai: "Ise kaunsi policy ne handle kiya? Server ko kaunsa source address dikha? Abhi traffic flow ho raha hai?"</p>

<h3>Chaar commands</h3>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>get system session list</code></td><td>Har session ka ek-line summary</td></tr>
<tr><td><code>diagnose sys session filter ...</code></td><td>Agle commands kin sessions par lagenge yeh chuno</td></tr>
<tr><td><code>diagnose sys session list</code></td><td>Filtered sessions ki poori detail</td></tr>
<tr><td><code>diagnose sys session clear</code></td><td>Filtered sessions delete karo</td></tr></table>
<p><code>diagnose sys session stat</code> totals deta hai. Busy firewall mein hazaaron sessions hote hain, isliye <b>hamesha pehle filter karo</b>: <code>diagnose sys session filter clear</code> se zero se shuru, phir jaise <code>diagnose sys session filter dst 8.8.8.8</code>. Doosre filter keys: <code>src</code>, <code>sport</code>, <code>dport</code>, <code>proto</code> aur <code>policy</code>.</p>

<h3>Ek-line view</h3>
<pre class="out">get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
icmp    42     10.0.1.10:19499       -                     10.0.2.10:8           -
icmp    48     10.0.1.10:19499       203.0.113.2:40001     8.8.8.8:8             -</pre>
<p>Same PC ke do sessions: ek DMZ server ko bina source NAT, ek Internet ko source NAT <b>203.0.113.2:40001</b> ke saath. EXPIRE seconds mein ginti ghatata hai. ICMP ke liye "port" ICMP type ya id hai; TCP aur UDP ke liye asli port.</p>

<h3>Poora view, field by field</h3>
<p>PC1 se ping ke baad destination 8.8.8.8 par filter kiya:</p>
<pre class="out">diagnose sys session filter dst 8.8.8.8
diagnose sys session list
session info: <span class="hl">proto=1</span> proto_state=00 duration=9 expire=51 timeout=0 flags=00000000 socktype=0 sockport=0 av_idx=0 use=3
...
statistic(bytes/packets/allow_err): <span class="hl">org=520/5/1 reply=520/5/1</span> tuples=2
...
orgin-&gt;sink: org pre-&gt;post, reply pre-&gt;post <span class="hl">dev=4-&gt;3/3-&gt;4</span> gwy=203.0.113.1/10.0.1.10
hook=post dir=org <span class="hl">act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(203.0.113.2:40001)</span>
hook=pre dir=reply act=dnat 8.8.8.8:40001-&gt;203.0.113.2:0(10.0.1.10:19499)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
serial=000025d2 tos=ff/ff app_list=0 app=0 url_cat=0
total session 1</pre>
<table class="cmp"><tr><th>Field</th><th>Matlab</th></tr>
<tr><td><code>proto=1</code></td><td>IP protocol number: 1 ICMP, 6 TCP, 17 UDP</td></tr>
<tr><td><code>expire=51</code></td><td>Idle rehne par session hatne tak seconds</td></tr>
<tr><td><code>org=520/5/1 reply=520/5/1</code></td><td>Har direction mein bytes, packets aur allow errors: traffic dono taraf flow hua</td></tr>
<tr><td><code>dev=4-&gt;3/3-&gt;4</code></td><td>Interface indexes (ingress se egress, aur wapas); <code>diagnose ip arp list</code> dikhata hai ki index 4 port2 hai aur index 3 port1</td></tr>
<tr><td><code>act=snat ... (203.0.113.2:40001)</code></td><td>Source NAT laga: server ko 203.0.113.2 port 40001 dikhta hai</td></tr>
<tr><td><code>policy_id=1</code></td><td>Jis policy ne session banaya</td></tr>
<tr><td><code>app_list, app, url_cat</code></td><td>Session se bound application aur URL category; koi profile pehchane na to zero</td></tr></table>
<p>Reply hook translation ko ulta dikhata hai: 203.0.113.2 port 40001 par wapas aane wala traffic 10.0.1.10 port 19499 mein translate hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Session tuples">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Original</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">10.0.1.10 se 8.8.8.8</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">NAT</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">source 203.0.113.2:40001</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Reply</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">8.8.8.8 se 203.0.113.2</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Back</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">10.0.1.10 mein translate</text>
</svg><p class="cap">Session dono directions aur translation store karta hai.</p></div>

<h3>TCP session</h3>
<p>DMZ server ke web session (policy 2, bina NAT) ke liye table normal TCP life dikhata hai: <code>proto=6</code>, <code>proto_state=01</code> (established), ek ghante ke timeout mein <code>expire=3594</code>, <code>act=noop</code> wale hooks (koi translation nahi), aur <code>policy_id=2</code>. Ek-line view kehta hai <code>tcp 3591 10.0.1.10:57160 - 10.0.2.10:80 -</code>.</p>

<h3>Sessions clear karna</h3>
<p>Existing sessions apni banane wali policy rakhte hain. Policy change ke baad table mein pehle se maujood flows purane rules ke saath chalte rehte hain jab tak expire na ho. Sirf wahi delete karne ke liye filter ke saath <code>diagnose sys session clear</code> use karo, phir <code>diagnose sys session filter clear</code> chalao taaki agle engineer ko poori table dikhe.</p>

<div class="eg"><p><b>Worked example.</b> Lab task: "8.8.8.8 ke session ko kaunsi policy ne banaya?" Aap <code>diagnose sys session filter clear</code>, <code>diagnose sys session filter dst 8.8.8.8</code>, <code>diagnose sys session list</code> chalate ho aur <code>policy_id=1</code> padhte ho. Phir <code>diagnose sys session clear</code> use hata deta hai aur <code>diagnose sys session filter clear</code> filter reset karta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Production unit par bina filter ke <code>diagnose sys session clear</code> chalana. Yeh har session drop karta hai, live voice calls aur VPN traffic samet. Hamesha precise filter set karo aur pehle list karke dekho kya delete hoga.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>session list</code> ya <code>session clear</code> par lagne se pehle filter set hona zaroori hai. Session policy ID aur NAT actions rakhta hai; policy ke changes existing sessions ko tab tak nahi badalte jab tak woh khatam ya clear na ho.</p></div>

<div class="scn"><h4>Session jo policy change se bach gaya</h4><p>Game server block karne ke liye policy badli gayi, lekin ek player connected raha. Engineer ne server address par filtered sessions list kiye, ek lamba chalta session mila jo abhi bhi purani policy ID ko point kar raha tha, sirf wahi session clear kiya, aur agli connection koshish denied aur logged hui.</p><p><b>Lesson:</b> policy change open sessions par retroactive nahi hota.</p></div>

<div class="iv"><p class="q">"Kaise dekhoge ki client ne kaunsa NAT address use kiya aur kaunsi policy ne allow kiya?"</p><p>Session table mein: destination ya source par filter karo, full session list chalao, aur <code>policy_id</code> tatha <code>act=snat</code> line padho jo translated source address aur port dikhati hai. <code>get system session list</code> wahi translation ek line mein deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hamesha pehle filter, phir list; clear sirf filtered sessions delete karta hai.</li>
<li>policy_id, act=snat/dnat, dono directions ke byte counters aur expire padho.</li>
<li>get system session list source NAT ke saath ek-line view deta hai.</li>
<li>Existing sessions clear ya expire hone tak purani policy rakhte hain.</li>
<li>Kaam khatam hone par filter reset karo.</li>
</ul></div>
`}};export{e as default};