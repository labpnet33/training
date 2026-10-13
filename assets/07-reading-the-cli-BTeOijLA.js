var e={id:`reading-the-cli`,h:{en:`Reading a Junos session before you type one`,hi:`Type karne se pehle Junos session padhna seekho`},body:{en:`
<p>You will meet real Junos output in every later module. This chapter lets you read a short session line by line, so that your first real command does not feel strange. No lab is needed: just read and follow the logic.</p>

<h3>The prompt tells you three things</h3>
<pre class="out"><span class="hl">lab@R1&gt;</span></pre>
<p><code>lab</code> is the user, <code>R1</code> is the host name, and the final character is the mode: <code>&gt;</code> operational, <code>#</code> configuration. A root user would see <code>root@R1:~ #</code> in the shell and <code>root@R1&gt;</code> after typing <code>cli</code>.</p>

<h3>Help is built in</h3>
<p>Press <code>?</code> at any point to see what can come next, and <b>Space</b> or <b>Tab</b> to complete a word. You can shorten any command to a unique prefix, for example <code>sh int te</code> for <code>show interfaces terse</code>.</p>
<pre class="out">lab@R1&gt; show ?
Possible completions:
  arp                  Show system's ARP table entries
  configuration        Show current configuration
  interfaces           Show interface information
  route                Show routing table information
  version              Display software information</pre>

<h3>A first look at a device</h3>
<pre class="code">lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     192.0.2.1/24
ge-0/0/1                up    down
lo0                     up    up
lo0.0                   up    up   inet     198.51.100.1        --&gt; 0/0</pre>
<p>How to read it: <code>ge-0/0/0</code> is the <b>physical</b> interface; <code>ge-0/0/0.0</code> is its <b>logical unit 0</b>, where the IP address lives. Admin <code>up</code> means not disabled by configuration. Link <code>up</code> means the cable and the far end are alive. <code>ge-0/0/1</code> is admin up but link down: a cable or far-end problem, not a configuration one.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Physical interface and logical unit">
<rect x="40" y="30" width="250" height="110" rx="10" fill="#bae6fd"/><text x="165" y="55" text-anchor="middle" class="svg-ink" font-size="13">ge-0/0/0 (physical port)</text>
<rect x="70" y="70" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="165" y="92" text-anchor="middle" class="svg-ink" font-size="13">unit 0 = ge-0/0/0.0</text><text x="165" y="110" text-anchor="middle" class="svg-ink" font-size="12">family inet 192.0.2.1/24</text>
<text x="465" y="60" text-anchor="middle" class="svg-ink" font-size="13">Read the name:</text>
<text x="465" y="85" text-anchor="middle" class="svg-muted" font-size="12">ge = Gigabit Ethernet</text>
<text x="465" y="105" text-anchor="middle" class="svg-muted" font-size="12">0/0/0 = slot / PIC / port</text>
<text x="465" y="125" text-anchor="middle" class="svg-muted" font-size="12">.0 = logical unit</text>
</svg><p class="cap">An IP address never sits on the physical port itself on Junos; it sits on a logical unit under a family.</p></div>

<h3>Showing the configuration</h3>
<pre class="code">lab@R1&gt; show configuration interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24

lab@R1&gt; show configuration | match 192.0.2
            address 192.0.2.1/24;</pre>
<p>The pipe (<code>|</code>) sends output through a filter: <code>match</code> keeps matching lines, <code>except</code> removes them, <code>count</code> counts lines, <code>find</code> starts from a pattern, <code>no-more</code> turns off paging, and <code>display set</code> flattens the tree.</p>

<h3>Your first change, read-only walkthrough</h3>
<pre class="code">lab@R1&gt; configure
[edit]
lab@R1# set system host-name EDGE-R1
lab@R1# show | compare
[edit system]
-  host-name R1;
+  host-name EDGE-R1;
lab@R1# commit
commit complete
lab@R1# exit</pre>
<p><code>show | compare</code> shows exactly what will change: <code>-</code> lines are removed, <code>+</code> lines are added. It is the habit of every careful Junos engineer. After <code>commit</code> the prompt changes to the new host name.</p>

<div class="eg"><p><b>Worked example.</b> You are told "interface ge-0/0/1 is not working". Read it like a doctor: <code>show interfaces terse</code> shows admin up, link down. Configuration is fine, so the problem is physical: cable unplugged, wrong port, or far end shut. You never needed to change anything to learn that.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting that <code>show</code> in configuration mode shows the <i>candidate</i>, not the active configuration, and that it displays configuration, not interface status. Use <code>run show interfaces terse</code> for status.</p></div>

<div class="scn"><h4>The unlucky cable</h4><p>A branch reported "the router is broken". The engineer opened <code>show interfaces terse</code> remotely and saw ge-0/0/0 admin up, link down. Someone had moved a patch cable during a cleaning visit. A site contact replugged the cable, the link came up, and the engineer confirmed with <code>ping</code>. No configuration change was made, no commit, no risk.</p><p><b>Lesson:</b> learn to read output first. Many incidents are solved by reading, not typing.</p></div>

<div class="iv"><p class="q">"How do you quickly check which interfaces are up and what IP addresses they have?"</p><p>Run <code>show interfaces terse</code>; mention admin versus link state and that addresses are on logical units. Add <code>| match inet</code> to show only interfaces with IPv4, and <code>show configuration interfaces | display set</code> to see how it is configured.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The prompt shows user, host name and mode (&gt; operational, # configuration).</li>
<li>? lists options, Tab completes, and any unique prefix works.</li>
<li>Interfaces have a physical name and logical units; IP addresses live on units.</li>
<li>Admin up and link down points to a physical problem, not a configuration one.</li>
<li>Use | match, | count, | display set and show | compare as daily habits.</li>
</ul></div>
`,hi:`
<p>Aage ke har module mein aapko asli Junos output milega. Yeh chapter ek chhote session ko line by line padhna sikhata hai, taaki aapka pehla asli command ajeeb na lage. Lab ki zaroorat nahi: bas padho aur logic follow karo.</p>

<h3>Prompt teen cheezein batata hai</h3>
<pre class="out"><span class="hl">lab@R1&gt;</span></pre>
<p><code>lab</code> user hai, <code>R1</code> host name hai, aur aakhri character mode hai: <code>&gt;</code> operational, <code>#</code> configuration. Root user shell mein <code>root@R1:~ #</code> dekhta hai aur <code>cli</code> type karne ke baad <code>root@R1&gt;</code>.</p>

<h3>Help built-in hai</h3>
<p>Kisi bhi point par <code>?</code> dabao aur dekho aage kya aa sakta hai, aur word poora karne ke liye <b>Space</b> ya <b>Tab</b>. Koi bhi command unique prefix tak chhota kar sakte ho, jaise <code>show interfaces terse</code> ke liye <code>sh int te</code>.</p>
<pre class="out">lab@R1&gt; show ?
Possible completions:
  arp                  Show system's ARP table entries
  configuration        Show current configuration
  interfaces           Show interface information
  route                Show routing table information
  version              Display software information</pre>

<h3>Device par pehli nazar</h3>
<pre class="code">lab@R1&gt; show interfaces terse
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     192.0.2.1/24
ge-0/0/1                up    down
lo0                     up    up
lo0.0                   up    up   inet     198.51.100.1        --&gt; 0/0</pre>
<p>Kaise padhein: <code>ge-0/0/0</code> <b>physical</b> interface hai; <code>ge-0/0/0.0</code> uska <b>logical unit 0</b> hai, jahan IP address rehta hai. Admin <code>up</code> ka matlab configuration se disable nahi hai. Link <code>up</code> ka matlab cable aur doosra sira zinda hai. <code>ge-0/0/1</code> admin up lekin link down hai: cable ya far-end ki problem, configuration ki nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Physical interface aur logical unit">
<rect x="40" y="30" width="250" height="110" rx="10" fill="#bae6fd"/><text x="165" y="55" text-anchor="middle" class="svg-ink" font-size="13">ge-0/0/0 (physical port)</text>
<rect x="70" y="70" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="165" y="92" text-anchor="middle" class="svg-ink" font-size="13">unit 0 = ge-0/0/0.0</text><text x="165" y="110" text-anchor="middle" class="svg-ink" font-size="12">family inet 192.0.2.1/24</text>
<text x="465" y="60" text-anchor="middle" class="svg-ink" font-size="13">Naam kaise padhein:</text>
<text x="465" y="85" text-anchor="middle" class="svg-muted" font-size="12">ge = Gigabit Ethernet</text>
<text x="465" y="105" text-anchor="middle" class="svg-muted" font-size="12">0/0/0 = slot / PIC / port</text>
<text x="465" y="125" text-anchor="middle" class="svg-muted" font-size="12">.0 = logical unit</text>
</svg><p class="cap">Junos par IP address physical port par nahi, family ke neeche logical unit par lagta hai.</p></div>

<h3>Configuration dikhana</h3>
<pre class="code">lab@R1&gt; show configuration interfaces ge-0/0/0 | display set
set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24

lab@R1&gt; show configuration | match 192.0.2
            address 192.0.2.1/24;</pre>
<p>Pipe (<code>|</code>) output ko filter se guzarta hai: <code>match</code> matching lines rakhta hai, <code>except</code> hata deta hai, <code>count</code> lines gintaa hai, <code>find</code> pattern se shuru karta hai, <code>no-more</code> paging band karta hai, aur <code>display set</code> tree ko flat kar deta hai.</p>

<h3>Aapka pehla change, sirf padhne ke liye</h3>
<pre class="code">lab@R1&gt; configure
[edit]
lab@R1# set system host-name EDGE-R1
lab@R1# show | compare
[edit system]
-  host-name R1;
+  host-name EDGE-R1;
lab@R1# commit
commit complete
lab@R1# exit</pre>
<p><code>show | compare</code> bilkul dikhata hai kya badlega: <code>-</code> lines hat rahi hain, <code>+</code> lines judd rahi hain. Yeh har careful Junos engineer ki aadat hai. <code>commit</code> ke baad prompt naye host name mein badal jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko bataya jaata hai "interface ge-0/0/1 kaam nahi kar raha". Doctor ki tarah padho: <code>show interfaces terse</code> admin up, link down dikhata hai. Configuration theek hai, to problem physical hai: cable nikla, galat port, ya far end shut. Yeh jaanne ke liye kuch badalna nahi pada.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh bhoolna ki configuration mode mein <code>show</code> <i>candidate</i> dikhata hai, active configuration nahi, aur woh configuration dikhata hai, interface status nahi. Status ke liye <code>run show interfaces terse</code> use karo.</p></div>

<div class="scn"><h4>Badqismat cable</h4><p>Ek branch ne report kiya "router kharab hai". Engineer ne remotely <code>show interfaces terse</code> kholaa aur ge-0/0/0 admin up, link down dekha. Safai ke dauran kisi ne patch cable hata diya tha. Site contact ne cable dobara lagaya, link up ho gaya, aur engineer ne <code>ping</code> se confirm kiya. Koi configuration change nahi, koi commit nahi, koi risk nahi.</p><p><b>Lesson:</b> pehle output padhna seekho. Kai incidents type karke nahi, padh kar solve hote hain.</p></div>

<div class="iv"><p class="q">"Kaise jaldi check karte ho ki kaunse interfaces up hain aur unke IP addresses kya hain?"</p><p><code>show interfaces terse</code> chalao; admin versus link state aur logical units par addresses ka zikr karo. <code>| match inet</code> jodo sirf IPv4 wale interfaces ke liye, aur <code>show configuration interfaces | display set</code> se dekho kaise configured hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prompt user, host name aur mode dikhata hai (&gt; operational, # configuration).</li>
<li>? options dikhata hai, Tab complete karta hai, aur koi bhi unique prefix chalta hai.</li>
<li>Interfaces ka physical naam aur logical units hote hain; IP addresses units par rehte hain.</li>
<li>Admin up aur link down physical problem batata hai, configuration ki nahi.</li>
<li>| match, | count, | display set aur show | compare roz ki aadat banao.</li>
</ul></div>
`}};export{e as default};