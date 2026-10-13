var e={id:`netplan`,h:{en:`Permanent configuration with netplan: the startup-config of Ubuntu`,hi:`netplan se permanent configuration: Ubuntu ki startup-config`},body:{en:`
<p>On a router you type config into the running-config and then <code>write memory</code> so it survives a reload. Linux works the same way. Commands like <code>ip addr add</code> change the <b>running</b> state only. The <b>saved</b> state lives in files. On Ubuntu Server those files are <b>netplan</b> files in the folder <code>/etc/netplan/</code>. <code>netplan apply</code> reads them and makes the running state match; at every boot the same files are applied again.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ip changes the running state; netplan files are the saved state applied at boot">
<rect x="20" y="50" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">netplan YAML file</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">/etc/netplan/*.yaml</text>
<rect x="250" y="50" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="14">Running state</text><text x="335" y="100" text-anchor="middle" class="svg-muted" font-size="12">what ip shows now</text>
<rect x="470" y="50" width="150" height="70" rx="10" fill="#e2e8f0"/><text x="545" y="80" text-anchor="middle" class="svg-ink" font-size="14">Reboot</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">runtime ip lost</text>
<line x1="190" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><text x="220" y="70" text-anchor="middle" class="svg-accent" font-size="12">apply</text>
<line x1="420" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<path d="M545 120 Q545 155 105 155 Q105 135 105 120" fill="none" stroke="#64748b" stroke-width="2"/><text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">file is read again at boot</text>
</svg><p class="cap">The file is the startup-config; the ip command only edits the running state.</p></div>

<h3>Reading a netplan file</h3>
<p>The file is written in <b>YAML</b>, a format where indentation (spaces) shows what belongs to what. Here is the file the installer wrote on our lab server, shown with <code>sudo cat</code>:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">sudo cat /etc/netplan/50-cloud-init.yaml</span>
# This file was written by the installer.
network:
  version: 2
  ethernets:
    <span class="hl">ens160</span>:
      dhcp4: false
      addresses:
        - 10.30.0.10/24
      routes:
        - to: default
          via: 10.30.0.1
      nameservers:
        addresses: [10.30.0.1]
        search: [nk.lab]</pre>
<p>Line by line: <code>network</code> is the top level. <code>version: 2</code> is the format. <code>ethernets</code> lists wired interfaces. The name under it (<code>ens160</code>) must be the <b>real</b> interface name. <code>dhcp4: false</code> turns DHCP off. <code>addresses</code> is a list (each item starts with <code>- </code>) of IPs with prefix. <code>routes</code> holds the default route: <code>to: default</code>, <code>via</code> the gateway. <code>nameservers</code> sets the DNS servers and the search domain, which Chapter 5 uses. Older files use <code>gateway4:</code>, which still works but is deprecated in favour of <code>routes</code>.</p>
<p>The file is owned by root with mode 600 (<code>-rw-------</code>), because netplan configs may contain Wi-Fi or other secrets, and newer netplan complains if it is readable by everyone.</p>

<h3>The trap in Lab 1: the wrong interface name</h3>
<p>The file above configures <code>ens160</code>, but <code>ip link</code> showed that this server only has <code>eth0</code>. Netplan applies the settings to an interface that does not exist, so the real interface stays without an address. The fix is to change one name:</p>
<pre class="code"><span class="c"># sed -i edits a file in place; s/old/new/ replaces text</span>
sudo sed -i 's/ens160/eth0/' /etc/netplan/50-cloud-init.yaml
<span class="c"># make the running state match the file</span>
sudo netplan apply
<span class="c"># verify</span>
ip -br a
ip route</pre>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             10.30.0.10/24

netadmin@syslog02:~$ <span class="hl">ip route</span>
default via 10.30.0.1 dev eth0 proto static
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p><code>netplan apply</code> prints nothing when all is well; silence is success. The address and the default route are now present and, more importantly, they will be there after a reboot.</p>

<h3>The safe way on a remote server: netplan try</h3>
<p>If you apply a wrong IP while connected over SSH, you cut the branch you are sitting on. <code>sudo netplan try</code> applies the config for a countdown and rolls back by itself unless you confirm:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">sudo netplan try</span>
Do you want to keep these settings?

Press ENTER before the timeout to accept the new configuration

Configuration accepted.</pre>
<p>Think of it as the Linux version of <code>reload in 5</code> on a router. Use <code>try</code> whenever you work remotely; use <code>apply</code> on a console.</p>

<h3>YAML rules that save you hours</h3>
<ul>
<li><b>Spaces only, never tabs.</b> A tab makes netplan fail.</li>
<li><b>Indentation is meaning.</b> Two spaces per level is the convention; keep it consistent.</li>
<li>Lists use <code>- item</code> on separate lines, or the short form <code>[a, b]</code>.</li>
<li>Netplan error messages name the line; read them.</li>
</ul>
<p>The reference-only commands <code>sudo netplan generate</code> (check and build the backend config without applying) and <code>sudo netplan get</code> exist on real systems; in the simulator <code>netplan get</code> shows only a partial view, so rely on <code>cat</code> and <code>ip</code> for verification.</p>

<div class="eg"><p><b>Worked example.</b> You need to change the server address from 10.30.0.10/24 to 10.30.0.20/24 permanently. Edit the <code>addresses</code> line in the file, run <code>sudo netplan try</code>, check <code>ip -br a</code>, press Enter to keep it. Reboot later: the new address is still there.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Editing <code>/etc/resolv.conf</code> or running only <code>ip</code> commands and thinking the job is done. Netplan rewrites the runtime state from its files, so a manual change that is not in the YAML disappears at the next apply or reboot.</p></div>
<div class="exam"><p><b>Exam trap.</b> Netplan is Ubuntu (and Canonical) specific. Red Hat style systems use NetworkManager or ifcfg files, and older Debian used <code>/etc/network/interfaces</code>. Know the principle (runtime versus saved) and the Ubuntu tool name.</p></div>

<div class="scn"><h4>Wrong name, right address, no network</h4><p>A server rebuilt from a template came up with no address after every reboot. The netplan file was perfect but named <code>ens160</code> while the new hypervisor presented <code>eth0</code>. The engineer had been adding the address by hand each time. Renaming the interface in the file and running <code>netplan apply</code> ended the Monday-morning ritual.</p><p><b>Lesson:</b> match the file to <code>ip link</code>, not to what the template used to say.</p></div>

<div class="iv"><p class="q">"How do you make a network change permanent on Ubuntu, and how do you test it safely over SSH?"</p><p>Edit the YAML file in <code>/etc/netplan/</code>, then run <code>sudo netplan try</code>, which rolls back automatically if I lose connectivity, and confirm with Enter. Finally I verify with <code>ip -br a</code> and <code>ip route</code>. I make sure the interface name matches <code>ip link</code> and that indentation uses spaces.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Netplan files in <code>/etc/netplan/</code> are the saved configuration; <code>ip</code> is runtime only.</li>
<li>The interface name in the file must match <code>ip link</code>.</li>
<li><code>netplan apply</code> is silent on success; <code>netplan try</code> auto-rolls back.</li>
<li>YAML needs spaces and consistent indentation, never tabs.</li>
<li>Verify with <code>ip -br a</code> and <code>ip route</code> after every change.</li>
</ul></div>
`,hi:`
<p>Router par aap running-config mein config type karte ho aur phir <code>write memory</code> karte ho taaki reload ke baad bhi rahe. Linux bhi aise hi kaam karta hai. <code>ip addr add</code> jaise commands sirf <b>running</b> state badalte hain. <b>Saved</b> state files mein rehti hai. Ubuntu Server par woh files folder <code>/etc/netplan/</code> ki <b>netplan</b> files hain. <code>netplan apply</code> unhe padh kar running state ko match karta hai; har boot par wahi files dobara apply hoti hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="ip running state badalta hai; netplan files saved state hain jo boot par apply hoti hain">
<rect x="20" y="50" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">netplan YAML file</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">/etc/netplan/*.yaml</text>
<rect x="250" y="50" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="335" y="80" text-anchor="middle" class="svg-ink" font-size="14">Running state</text><text x="335" y="100" text-anchor="middle" class="svg-muted" font-size="12">ip abhi jo dikhata hai</text>
<rect x="470" y="50" width="150" height="70" rx="10" fill="#e2e8f0"/><text x="545" y="80" text-anchor="middle" class="svg-ink" font-size="14">Reboot</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">runtime ip gaya</text>
<line x1="190" y1="80" x2="250" y2="80" stroke="#64748b" stroke-width="2"/><text x="220" y="70" text-anchor="middle" class="svg-accent" font-size="12">apply</text>
<line x1="420" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<path d="M545 120 Q545 155 105 155 Q105 135 105 120" fill="none" stroke="#64748b" stroke-width="2"/><text x="330" y="150" text-anchor="middle" class="svg-accent" font-size="12">boot par file dobara padhi jaati hai</text>
</svg><p class="cap">File startup-config hai; ip command sirf running state edit karta hai.</p></div>

<h3>Netplan file padhna</h3>
<p>File <b>YAML</b> mein likhi hoti hai, ek format jisme indentation (spaces) batata hai kya kiska hissa hai. Hamare lab server par installer ne jo file likhi, <code>sudo cat</code> se:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">sudo cat /etc/netplan/50-cloud-init.yaml</span>
# This file was written by the installer.
network:
  version: 2
  ethernets:
    <span class="hl">ens160</span>:
      dhcp4: false
      addresses:
        - 10.30.0.10/24
      routes:
        - to: default
          via: 10.30.0.1
      nameservers:
        addresses: [10.30.0.1]
        search: [nk.lab]</pre>
<p>Line by line: <code>network</code> top level hai. <code>version: 2</code> format hai. <code>ethernets</code> wired interfaces ki list deta hai. Uske neeche ka naam (<code>ens160</code>) <b>asli</b> interface name hona chahiye. <code>dhcp4: false</code> DHCP band karta hai. <code>addresses</code> ek list hai (har item <code>- </code> se shuru) prefix ke saath IPs ki. <code>routes</code> mein default route hai: <code>to: default</code>, <code>via</code> gateway. <code>nameservers</code> DNS servers aur search domain set karta hai, jo Chapter 5 use karta hai. Purani files <code>gateway4:</code> use karti hain, jo chalta hai par <code>routes</code> ke favour mein deprecated hai.</p>
<p>File root ki hai aur mode 600 (<code>-rw-------</code>), kyunki netplan configs mein Wi-Fi ya doosre secrets ho sakte hain, aur naya netplan shikayat karta hai agar file sabke liye readable ho.</p>

<h3>Lab 1 ka trap: galat interface name</h3>
<p>Upar ki file <code>ens160</code> configure karti hai, par <code>ip link</code> ne dikhaya ki is server par sirf <code>eth0</code> hai. Netplan settings aise interface par lagata hai jo exist hi nahi karta, isliye asli interface bina address ke rehta hai. Fix ek naam badalna hai:</p>
<pre class="code"><span class="c"># sed -i file ko wahin edit karta hai; s/old/new/ text badalta hai</span>
sudo sed -i 's/ens160/eth0/' /etc/netplan/50-cloud-init.yaml
<span class="c"># running state ko file se match karo</span>
sudo netplan apply
<span class="c"># verify</span>
ip -br a
ip route</pre>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             10.30.0.10/24

netadmin@syslog02:~$ <span class="hl">ip route</span>
default via 10.30.0.1 dev eth0 proto static
10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</pre>
<p>Sab theek ho to <code>netplan apply</code> kuch print nahi karta; khamoshi hi success hai. Address aur default route ab maujood hain aur, zyada zaroori, reboot ke baad bhi honge.</p>

<h3>Remote server par safe tareeka: netplan try</h3>
<p>SSH se connected hote hue galat IP apply karoge to us daal ko kaat doge jis par baithe ho. <code>sudo netplan try</code> countdown tak config apply karta hai aur aap confirm na karo to apne aap rollback kar deta hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">sudo netplan try</span>
Do you want to keep these settings?

Press ENTER before the timeout to accept the new configuration

Configuration accepted.</pre>
<p>Ise router ke <code>reload in 5</code> ka Linux version samjho. Remotely kaam karte waqt <code>try</code> use karo; console par <code>apply</code>.</p>

<h3>YAML ke rules jo ghanton bachate hain</h3>
<ul>
<li><b>Sirf spaces, kabhi tabs nahi.</b> Tab se netplan fail ho jaata hai.</li>
<li><b>Indentation hi meaning hai.</b> Har level par do spaces convention hai; consistent rakho.</li>
<li>Lists alag lines par <code>- item</code> se, ya short form <code>[a, b]</code> mein.</li>
<li>Netplan error messages line ka naam batate hain; unhe padho.</li>
</ul>
<p>Reference-only commands <code>sudo netplan generate</code> (bina apply kiye check aur backend config banao) aur <code>sudo netplan get</code> asli systems par hote hain; simulator mein <code>netplan get</code> sirf adhoora view dikhata hai, isliye verification ke liye <code>cat</code> aur <code>ip</code> par bharosa karo.</p>

<div class="eg"><p><b>Worked example.</b> Server address 10.30.0.10/24 se 10.30.0.20/24 permanently badalna hai. File ki <code>addresses</code> line edit karo, <code>sudo netplan try</code> chalao, <code>ip -br a</code> check karo, rakhne ke liye Enter dabao. Baad mein reboot karo: naya address ab bhi hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> <code>/etc/resolv.conf</code> edit karna ya sirf <code>ip</code> commands chalana aur sochna kaam ho gaya. Netplan apni files se runtime state dobara likhta hai, isliye jo manual change YAML mein nahi woh agle apply ya reboot par gayab ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Netplan Ubuntu (aur Canonical) specific hai. Red Hat style systems NetworkManager ya ifcfg files use karte hain, aur purana Debian <code>/etc/network/interfaces</code>. Principle (runtime versus saved) aur Ubuntu ke tool ka naam dono yaad rakho.</p></div>

<div class="scn"><h4>Naam galat, address sahi, network nahi</h4><p>Template se rebuild hua server har reboot ke baad bina address ke uthta tha. Netplan file bilkul sahi thi par naam <code>ens160</code> tha jabki naya hypervisor <code>eth0</code> dikha raha tha. Engineer har baar address haath se jodta tha. File mein interface ka naam badal kar <code>netplan apply</code> chalane se Monday-subah ka yeh ritual khatam hua.</p><p><b>Lesson:</b> file ko <code>ip link</code> se match karo, us se nahi jo template mein pehle likha tha.</p></div>

<div class="iv"><p class="q">"Ubuntu par network change permanent kaise karte ho, aur SSH par safely test kaise karte ho?"</p><p>Main <code>/etc/netplan/</code> ki YAML file edit karta hoon, phir <code>sudo netplan try</code> chalata hoon jo connectivity jaane par apne aap rollback karta hai, aur Enter se confirm karta hoon. Akhir mein <code>ip -br a</code> aur <code>ip route</code> se verify. Dhyan rakhta hoon ki interface name <code>ip link</code> se match kare aur indentation spaces ki ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>/etc/netplan/</code> ki files saved configuration hain; <code>ip</code> sirf runtime hai.</li>
<li>File ka interface name <code>ip link</code> se match hona chahiye.</li>
<li><code>netplan apply</code> success par silent hai; <code>netplan try</code> auto-rollback karta hai.</li>
<li>YAML ko spaces aur consistent indentation chahiye, tabs kabhi nahi.</li>
<li>Har change ke baad <code>ip -br a</code> aur <code>ip route</code> se verify karo.</li>
</ul></div>
`}};export{e as default};