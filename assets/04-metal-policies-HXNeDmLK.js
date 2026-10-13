var e={id:`metal-policies`,h:{en:`Platinum, gold, silver, bronze: the metal policies`,hi:`Platinum, gold, silver, bronze: metal policies`},body:{en:`
<p>A concert venue sells four ticket classes: platinum, gold, silver and bronze. Your ticket does not move you closer to the stage by shouting. It sets the <b>best seat you are allowed</b>. If a bronze ticket holder walks in with a platinum wristband they made themselves, the doorman swaps the wristband. The 9800 metal policies work like that: each WLAN gets a ceiling on the QoS marking its traffic may carry.</p>

<h3>What the four metals are</h3>
<p>On the Catalyst 9800 the controller has four built-in QoS profiles, each in two forms: an <b>output</b> form (network to client) and an <b>input</b> form with the suffix <code>-up</code> (client to network). They are system policy-maps, so you cannot edit or delete them. You attach them to a <b>policy profile</b>.</p>
<table class="cmp"><tr><th>Metal</th><th>Intended traffic</th><th>Maximum DSCP</th><th>Highest AC</th></tr>
<tr><td>platinum</td><td>voice</td><td>46 (ef)</td><td>AC_VO</td></tr>
<tr><td>gold</td><td>video</td><td>34 (af41)</td><td>AC_VI</td></tr>
<tr><td>silver</td><td>best effort (default)</td><td>0</td><td>AC_BE</td></tr>
<tr><td>bronze</td><td>background, guests</td><td>8 (cs1)</td><td>AC_BK</td></tr></table>
<p>The rule is a <b>cap</b>: a marking above the ceiling is lowered to it; a marking below the ceiling passes. Platinum with DSCP 46 passes. Gold with DSCP 46 becomes 34. Silver turns everything into 0. Bronze turns everything above 8 into 8.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Metal caps">
<line x1="60" y1="180" x2="600" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="40" width="80" height="140" rx="6" fill="#ddd6fe"/><text x="130" y="100" text-anchor="middle" class="svg-ink" font-size="13">platinum</text><text x="130" y="120" text-anchor="middle" class="svg-muted" font-size="12">cap 46</text>
<rect x="210" y="76" width="80" height="104" rx="6" fill="#fde68a"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="13">gold</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">cap 34</text>
<rect x="330" y="150" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="370" y="170" text-anchor="middle" class="svg-ink" font-size="13">silver 0</text>
<rect x="450" y="138" width="80" height="42" rx="6" fill="#fed7aa"/><text x="490" y="163" text-anchor="middle" class="svg-ink" font-size="13">bronze 8</text>
<text x="330" y="22" text-anchor="middle" class="svg-accent" font-size="13">A marking above the bar is lowered to the bar</text>
</svg><p class="cap">The height of each bar is the highest DSCP the WLAN may carry.</p></div>

<h3>Attach them to the policy profile</h3>
<p>The policy profile owns the QoS of every WLAN mapped to it through the policy tag. It must be shut while you change it. A metal policy on the <b>wrong direction</b> is refused: <code>platinum-up</code> is input only.</p>
<pre class="code">wireless profile policy PP-VOICE
 shutdown
 vlan 30
 <span class="c">! input = client to network, output = network to client</span>
 service-policy input platinum-up
 service-policy output platinum
 no shutdown</pre>
<pre class="out">WLC1(config-wireless-policy)# service-policy output platinum-up
% Policy-map platinum-up is a client-to-network (input) policy: attach it with service-policy input (platinum is the output form).</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b>, <b>Policy profile QoS</b>. Pick the policy profile and set input and output; the page disables the profile for you while it changes. The same fields appear in <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-VOICE &gt; QoS and AVC</b>.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show policy-map platinum
  Policy Map platinum
    System policy (output, network to client)
    <span class="hl">Maximum DSCP 46 (ef): a higher marking is capped to it</span>

WLC1# show wireless profile policy detailed PP-VOICE
...
QOS Service Policy
  <span class="hl">Input Policy Name              : platinum-up</span>
  <span class="hl">Output Policy Name             : platinum</span></pre>

<h3>Auto QoS macros</h3>
<p>The command <code>wireless autoqos policy-profile PP-VOICE mode voice</code> attaches a ready-made pair: <b>voice</b> and <b>fastlane</b> use platinum-up and platinum, <b>guest</b> uses bronze-up and bronze, and <b>enterprise-avc</b> uses the two <code>AutoQos-4.0-wlan-ET-SSID</code> policies and enables the AVC monitor both ways. Remove with <code>no wireless autoqos policy-profile PP-VOICE</code>. The detailed fastlane behaviour (Apple handling) and per-application remarking of the enterprise policy are <b>concept only</b>: the lab shows trusted marking for those system policies.</p>

<div class="eg"><p><b>Worked example.</b> A guest WLAN is mapped to PP-GUEST with bronze-up and bronze. A guest laptop runs a video call and marks DSCP 34. Upstream, bronze-up caps it to 8, so the wired network sees CS1. Downstream, a server marks 34, bronze lowers it to 8, the AP maps 8 to UP 1 and uses AC_BK. The guest call still works, but it can never starve the staff voice WLAN.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Using a metal on the wrong direction (<code>-up</code> on output).</li>
<li>Leaving the default silver on a voice WLAN: DSCP 46 is capped to 0 and voice becomes best effort.</li>
<li>Editing the policy profile without shutting it.</li>
<li>Expecting a metal policy to give a client priority on the air: it only caps the marking on the controller side.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> metal policies <b>limit</b> the marking, they do not raise it. A client that marks 0 stays 0 even under platinum. Also the cap value is an upper bound on DSCP, not a bandwidth guarantee: bandwidth statistics are concept only here.</p></div>

<div class="scn"><h4>Silver under the voice WLAN</h4><p>After a template push, handsets on NK-VOICE use best effort. <code>show wireless profile policy detailed PP-VOICE</code> shows silver-up and silver. The engineer shuts the policy profile, sets platinum-up and platinum, enables it again, reconnects a phone and the trace shows DSCP 46 kept and AC_VO.</p><p><b>Lesson:</b> a silver policy silently flattens everything; always read the QoS block of the policy profile.</p></div>

<div class="iv"><p class="q">"What do the metal QoS profiles do on a 9800?"</p><p>They are built-in policy-maps in input and output forms. Each caps the maximum DSCP a WLAN may carry: platinum 46, gold 34, silver 0, bronze 8. Attached to the policy profile. Mention that they cap, not boost, and that the up form is input only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four metals, each in an input (-up) and an output form.</li>
<li>Caps in the lab model: platinum 46, gold 34, silver 0, bronze 8.</li>
<li>Attach with service-policy input and output on a shut policy profile.</li>
<li>A wrong-direction attach is refused; autoqos macros attach ready pairs.</li>
<li>Metals cap markings; they do not boost them or reserve bandwidth.</li>
</ul></div>
`,hi:`
<p>Ek concert venue chaar ticket classes bechta hai: platinum, gold, silver aur bronze. Aapka ticket chillane se aapko stage ke kareeb nahi le jaata. Woh sirf yeh tay karta hai ki aapko <b>kaunsi best seat allowed hai</b>. Agar bronze ticket wala khud banaya hua platinum wristband pehen kar aaye, to doorman wristband badal deta hai. 9800 ki metal policies aise hi kaam karti hain: har WLAN ko us QoS marking ki ek seema (ceiling) milti hai jo uska traffic carry kar sakta hai.</p>

<h3>Chaar metals kya hain</h3>
<p>Catalyst 9800 par controller ke paas chaar built-in QoS profiles hain, har ek do forms mein: <b>output</b> form (network se client) aur <code>-up</code> suffix wala <b>input</b> form (client se network). Yeh system policy-maps hain, isliye aap inhe edit ya delete nahi kar sakte. Inhe <b>policy profile</b> par attach karte hain.</p>
<table class="cmp"><tr><th>Metal</th><th>Intended traffic</th><th>Maximum DSCP</th><th>Sabse upar AC</th></tr>
<tr><td>platinum</td><td>voice</td><td>46 (ef)</td><td>AC_VO</td></tr>
<tr><td>gold</td><td>video</td><td>34 (af41)</td><td>AC_VI</td></tr>
<tr><td>silver</td><td>best effort (default)</td><td>0</td><td>AC_BE</td></tr>
<tr><td>bronze</td><td>background, guests</td><td>8 (cs1)</td><td>AC_BK</td></tr></table>
<p>Rule ek <b>cap</b> hai: seema se upar ki marking seema tak kam ho jaati hai; seema se neeche ki marking pass hoti hai. Platinum mein DSCP 46 pass hota hai. Gold mein DSCP 46 ban jaata hai 34. Silver sab kuch 0 kar deta hai. Bronze 8 se upar sab kuch 8 kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Metal caps">
<line x1="60" y1="180" x2="600" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="40" width="80" height="140" rx="6" fill="#ddd6fe"/><text x="130" y="100" text-anchor="middle" class="svg-ink" font-size="13">platinum</text><text x="130" y="120" text-anchor="middle" class="svg-muted" font-size="12">cap 46</text>
<rect x="210" y="76" width="80" height="104" rx="6" fill="#fde68a"/><text x="250" y="120" text-anchor="middle" class="svg-ink" font-size="13">gold</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">cap 34</text>
<rect x="330" y="150" width="80" height="30" rx="6" fill="#e2e8f0"/><text x="370" y="170" text-anchor="middle" class="svg-ink" font-size="13">silver 0</text>
<rect x="450" y="138" width="80" height="42" rx="6" fill="#fed7aa"/><text x="490" y="163" text-anchor="middle" class="svg-ink" font-size="13">bronze 8</text>
<text x="330" y="22" text-anchor="middle" class="svg-accent" font-size="13">Bar se upar ki marking bar tak kam hoti hai</text>
</svg><p class="cap">Har bar ki unchai woh sabse bada DSCP hai jo WLAN carry kar sakta hai.</p></div>

<h3>Policy profile par attach karo</h3>
<p>Policy profile un sab WLANs ki QoS ka maalik hai jo policy tag ke zariye uske saath map hain. Badalte waqt use shut hona chahiye. <b>Galat direction</b> par metal policy refuse hoti hai: <code>platinum-up</code> sirf input hai.</p>
<pre class="code">wireless profile policy PP-VOICE
 shutdown
 vlan 30
 <span class="c">! input = client se network, output = network se client</span>
 service-policy input platinum-up
 service-policy output platinum
 no shutdown</pre>
<pre class="out">WLC1(config-wireless-policy)# service-policy output platinum-up
% Policy-map platinum-up is a client-to-network (input) policy: attach it with service-policy input (platinum is the output form).</pre>
<p>Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; QoS</b>, <b>Policy profile QoS</b>. Policy profile chuno aur input aur output set karo; page badalte waqt profile ko khud disable kar deta hai. Yahi fields <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; PP-VOICE &gt; QoS and AVC</b> mein bhi hain.</p>

<h3>Verify</h3>
<pre class="out">WLC1# show policy-map platinum
  Policy Map platinum
    System policy (output, network to client)
    <span class="hl">Maximum DSCP 46 (ef): a higher marking is capped to it</span>

WLC1# show wireless profile policy detailed PP-VOICE
...
QOS Service Policy
  <span class="hl">Input Policy Name              : platinum-up</span>
  <span class="hl">Output Policy Name             : platinum</span></pre>

<h3>Auto QoS macros</h3>
<p>Command <code>wireless autoqos policy-profile PP-VOICE mode voice</code> ek ready-made pair attach karta hai: <b>voice</b> aur <b>fastlane</b> platinum-up aur platinum use karte hain, <b>guest</b> bronze-up aur bronze, aur <b>enterprise-avc</b> do <code>AutoQos-4.0-wlan-ET-SSID</code> policies use karta hai aur AVC monitor dono taraf enable karta hai. Hatane ke liye <code>no wireless autoqos policy-profile PP-VOICE</code>. Fastlane ka detailed behaviour (Apple handling) aur enterprise policy ka per-application remarking <b>concept only</b> hain: lab in system policies ke liye trusted marking dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Guest WLAN PP-GUEST se map hai jisme bronze-up aur bronze hain. Guest laptop video call chalata hai aur DSCP 34 mark karta hai. Upstream mein bronze-up use 8 tak cap karta hai, isliye wired network CS1 dekhta hai. Downstream mein server 34 mark karta hai, bronze use 8 kar deta hai, AP 8 ko UP 1 mein map karta hai aur AC_BK use karta hai. Guest call chalti hai, lekin woh staff voice WLAN ko kabhi bhookha nahi rakh sakti.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Galat direction par metal lagana (output par <code>-up</code>).</li>
<li>Voice WLAN par default silver chhod dena: DSCP 46 cap hokar 0 ho jaata hai aur voice best effort ban jaati hai.</li>
<li>Policy profile ko shut kiye bina edit karna.</li>
<li>Yeh umeed karna ki metal policy client ko air par priority degi: woh sirf controller side par marking cap karti hai.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> metal policies marking ko <b>limit</b> karti hain, badhati nahi. Jo client 0 mark karta hai woh platinum mein bhi 0 rehta hai. Cap value DSCP ki upper bound hai, bandwidth guarantee nahi: bandwidth statistics yahan concept only hain.</p></div>

<div class="scn"><h4>Voice WLAN ke neeche silver</h4><p>Template push ke baad NK-VOICE ke handsets best effort use karte hain. <code>show wireless profile policy detailed PP-VOICE</code> mein silver-up aur silver dikhte hain. Engineer policy profile shut karta hai, platinum-up aur platinum lagata hai, phir enable karta hai, phone reconnect karta hai aur trace mein DSCP 46 kept aur AC_VO dikhta hai.</p><p><b>Lesson:</b> silver chupke se sab kuch flat kar deta hai; policy profile ka QoS block hamesha padho.</p></div>

<div class="iv"><p class="q">"9800 par metal QoS profiles kya karte hain?"</p><p>Yeh input aur output forms mein built-in policy-maps hain. Har ek us maximum DSCP ko cap karta hai jo WLAN carry kar sakta hai: platinum 46, gold 34, silver 0, bronze 8. Policy profile par attach hote hain. Batao ki yeh cap karte hain, boost nahi, aur up form sirf input hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar metals, har ek input (-up) aur output form mein.</li>
<li>Lab model ke caps: platinum 46, gold 34, silver 0, bronze 8.</li>
<li>Shut policy profile par service-policy input aur output se attach karo.</li>
<li>Galat direction refuse hoti hai; autoqos macros ready pairs attach karte hain.</li>
<li>Metals marking cap karte hain; boost ya bandwidth reserve nahi karte.</li>
</ul></div>
`}};export{e as default};