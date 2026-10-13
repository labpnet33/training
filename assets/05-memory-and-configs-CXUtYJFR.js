var e={id:`configs`,h:{en:`Running vs startup configuration, device memory and show version`,hi:`Running vs startup configuration, device memory aur show version`},body:{en:`
<p>Imagine writing an important document on a whiteboard. Everyone in the room can read it and act on it right now, but if the cleaner wipes the board overnight it is gone. To keep it, you must copy it into a notebook. On a Cisco device the whiteboard is the <b>running-config</b> in RAM and the notebook is the <b>startup-config</b> in NVRAM. Forgetting to copy from one to the other is the most expensive beginner mistake in networking.</p>

<h3>The four kinds of memory</h3>
<table class="cmp"><tr><th>Memory</th><th>Keeps data after power-off?</th><th>What lives there</th></tr>
<tr><td><b>ROM</b></td><td>Yes (read-only)</td><td>POST, bootstrap program, ROMMON recovery monitor</td></tr>
<tr><td><b>Flash</b></td><td>Yes</td><td>The IOS image file(s), and other files you copy there</td></tr>
<tr><td><b>NVRAM</b></td><td>Yes</td><td>The <b>startup-config</b> (the saved configuration)</td></tr>
<tr><td><b>RAM</b></td><td>No</td><td>The running IOS, the <b>running-config</b>, routing tables, ARP and MAC tables, packet buffers</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Running and startup configuration">
<rect x="30" y="30" width="240" height="120" rx="10" fill="#bae6fd"/><text x="150" y="60" text-anchor="middle" class="svg-ink" font-size="14">RAM (volatile)</text><text x="150" y="88" text-anchor="middle" class="svg-accent" font-size="14">running-config</text><text x="150" y="115" text-anchor="middle" class="svg-muted" font-size="12">active now, lost at reload</text>
<rect x="370" y="30" width="240" height="120" rx="10" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="14">NVRAM (non-volatile)</text><text x="490" y="88" text-anchor="middle" class="svg-accent" font-size="14">startup-config</text><text x="490" y="115" text-anchor="middle" class="svg-muted" font-size="12">loaded at every boot</text>
<line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><polygon points="370,70 360,65 360,75" fill="#64748b"/>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">copy run start</text>
<line x1="370" y1="120" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><polygon points="270,120 280,115 280,125" fill="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">boot / reload</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">conf t changes go to RAM only, until you save</text>
</svg><p class="cap">Every configuration command edits the running-config. Only a save writes it to NVRAM.</p></div>

<h3>Running-config and startup-config</h3>
<p>The <b>running-config</b> is the configuration the device is using at this moment. Every command you enter in configuration mode changes it instantly. The <b>startup-config</b> is the copy saved in NVRAM; it is loaded into RAM at boot and becomes the new running-config. The two stay different until you save.</p>
<pre class="code">R1# show running-config          <span class="c">! what is active now (RAM)</span>
R1# show startup-config          <span class="c">! what will load at next boot (NVRAM)</span>
R1# copy running-config startup-config
Destination filename [startup-config]?    <span class="c">! press Enter to accept</span>
Building configuration...
[OK]
R1# write memory                 <span class="c">! older command, same result</span></pre>
<p><code>copy running-config startup-config</code> (<code>copy run start</code>) is the official command; <code>write memory</code> (<code>wr</code>) is older and still works on IOS. The <code>copy</code> command always reads <b>copy source destination</b>, which helps you remember the direction.</p>

<h3>Undoing and erasing</h3>
<ul>
<li>To undo one command, repeat it with <code>no</code> in front: <code>no ip domain-lookup</code> turned lookups off, <code>ip domain-lookup</code> turns them back on; <code>no description</code> removes a description.</li>
<li>To throw away all unsaved changes, <code>reload</code> without saving: IOS asks "System configuration has been modified. Save? [yes/no]" and you answer <b>no</b>. The device boots from the old startup-config.</li>
<li>To wipe a device back to factory state: <code>erase startup-config</code> (or <code>write erase</code>), then <code>reload</code>. On a switch you also delete <code>flash:vlan.dat</code> to remove VLANs, which you will meet in the VLAN module.</li>
<li><code>copy startup-config running-config</code> <b>merges</b> the saved configuration into the current one; it does not replace it. That surprises many people.</li>
</ul>

<h3>Reading show version</h3>
<p><code>show version</code> works in user EXEC and is the first command many engineers run on an unknown device. This is output from a real ISR router:</p>
<pre class="out"><span class="hl">Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M8, RELEASE SOFTWARE (fc2)</span>
ROM: System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE (fc1)
<span class="hl">R1 uptime is 3 weeks, 2 days, 4 hours, 11 minutes</span>
System returned to ROM by power-on
<span class="hl">System image file is "flash0:c2900-universalk9-mz.SPA.157-3.M8.bin"</span>
Cisco CISCO2911/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FTX1840AHK2
3 Gigabit Ethernet interfaces
255K bytes of non-volatile configuration memory.
250880K bytes of ATA System CompactFlash 0 (Read/Write)
<span class="hl">Configuration register is 0x2102</span></pre>
<p>From it you learn: the IOS version (15.7(3)M8), how long since the last reload and why ("power-on" versus "reload" or a crash), the image file name in flash, the hardware model and serial, the interface count, the NVRAM and flash sizes, and the <b>configuration register</b>. 0x2102 is the normal value: boot IOS from flash and load the startup-config. In the lab simulator the text is shorter and the image name differs, but the same fields are there.</p>

<div class="eg"><p><b>Worked example.</b> You configure R1 for thirty minutes and run <code>show startup-config</code>. It says <code>startup-config is not present</code>. Your work exists only in RAM. You run <code>copy run start</code>, press Enter, see <code>[OK]</code>, and now <code>show startup-config</code> begins with <code>Using 1482 out of 262144 bytes</code> followed by your configuration. A power cut now costs you nothing.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>copy startup-config running-config</code> when you meant to save (the direction is reversed and nothing is saved). Saving a broken experiment as the startup-config. Believing <code>copy start run</code> gives a clean rollback (it merges). Forgetting to save on the second device of a pair.</p></div>

<div class="exam"><p><b>Exam traps.</b> Running-config = RAM, startup-config = NVRAM, IOS image = flash, bootstrap/POST/ROMMON = ROM. Configuration changes apply immediately but are lost at reload unless saved. <code>show version</code> shows the configuration register; 0x2102 is the normal boot value. <code>erase startup-config</code> plus <code>reload</code> returns a router to defaults.</p></div>

<div class="scn"><h4>The Monday-morning mystery</h4><p>On Friday an engineer added a new branch subnet and static route to a WAN router and tested it successfully. Over the weekend a power maintenance rebooted the building. On Monday the branch was unreachable. <code>show version</code> showed "System returned to ROM by power-on" and an uptime of 1 day; <code>show running-config</code> had no trace of Friday's work. Nothing had been saved. The change was re-applied from the ticket notes and saved with <code>copy run start</code>, and the team added "save and verify startup-config" to their change checklist.</p><p><b>Lesson:</b> a change is not finished until it is saved. Uptime in <code>show version</code> is your first clue after an unexplained outage.</p></div>

<div class="iv"><p class="q">"What is the difference between the running-config and the startup-config?"</p><p>Strong answer: the running-config lives in RAM and is what the device uses right now; every configuration command changes it immediately. The startup-config lives in NVRAM and is loaded at boot. Changes are lost at reload unless you run <code>copy running-config startup-config</code> (or <code>write memory</code>). Mention that <code>copy start run</code> merges rather than replaces, and that you can compare the two to spot unsaved changes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ROM: POST and bootstrap. Flash: IOS image. NVRAM: startup-config. RAM: running-config and tables.</li>
<li>Configuration commands change the running-config instantly; nothing is saved automatically.</li>
<li>Save with <code>copy running-config startup-config</code> or <code>write memory</code>; copy is always source then destination.</li>
<li><code>show version</code> reveals IOS version, uptime, reload reason, image file and configuration register (0x2102).</li>
<li>Undo with <code>no</code>; factory-reset with <code>erase startup-config</code> and <code>reload</code>.</li>
</ul></div>
`,hi:`
<p>Socho aap ek zaroori document whiteboard par likh rahe ho. Room mein sab use abhi padh sakte hain aur uspe kaam kar sakte hain, lekin agar raat ko safai wala board poncch de to sab gaya. Use rakhne ke liye aapko notebook mein copy karna padega. Cisco device par whiteboard RAM mein <b>running-config</b> hai aur notebook NVRAM mein <b>startup-config</b> hai. Ek se dusre mein copy karna bhool jaana networking mein beginners ki sabse mehngi galti hai.</p>

<h3>Chaar tarah ki memory</h3>
<table class="cmp"><tr><th>Memory</th><th>Power-off ke baad data rehta hai?</th><th>Wahan kya rehta hai</th></tr>
<tr><td><b>ROM</b></td><td>Haan (read-only)</td><td>POST, bootstrap program, ROMMON recovery monitor</td></tr>
<tr><td><b>Flash</b></td><td>Haan</td><td>IOS image file(s), aur dusri files jo aap wahan copy karte ho</td></tr>
<tr><td><b>NVRAM</b></td><td>Haan</td><td><b>startup-config</b> (saved configuration)</td></tr>
<tr><td><b>RAM</b></td><td>Nahi</td><td>Chalta hua IOS, <b>running-config</b>, routing tables, ARP aur MAC tables, packet buffers</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Running aur startup configuration">
<rect x="30" y="30" width="240" height="120" rx="10" fill="#bae6fd"/><text x="150" y="60" text-anchor="middle" class="svg-ink" font-size="14">RAM (volatile)</text><text x="150" y="88" text-anchor="middle" class="svg-accent" font-size="14">running-config</text><text x="150" y="115" text-anchor="middle" class="svg-muted" font-size="12">abhi active, reload par gayab</text>
<rect x="370" y="30" width="240" height="120" rx="10" fill="#bbf7d0"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="14">NVRAM (non-volatile)</text><text x="490" y="88" text-anchor="middle" class="svg-accent" font-size="14">startup-config</text><text x="490" y="115" text-anchor="middle" class="svg-muted" font-size="12">har boot par load hoti hai</text>
<line x1="270" y1="70" x2="370" y2="70" stroke="#64748b" stroke-width="2"/><polygon points="370,70 360,65 360,75" fill="#64748b"/>
<text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">copy run start</text>
<line x1="370" y1="120" x2="270" y2="120" stroke="#64748b" stroke-width="2"/><polygon points="270,120 280,115 280,125" fill="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">boot / reload</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">conf t ke changes sirf RAM mein jaate hain, jab tak save na karo</text>
</svg><p class="cap">Har configuration command running-config edit karti hai. Sirf save hi use NVRAM mein likhta hai.</p></div>

<h3>Running-config aur startup-config</h3>
<p><b>Running-config</b> woh configuration hai jo device is pal use kar raha hai. Configuration mode mein daali gayi har command ise turant badal deti hai. <b>Startup-config</b> NVRAM mein saved copy hai; yeh boot par RAM mein load hoti hai aur nayi running-config ban jaati hai. Jab tak aap save nahi karte, dono alag rehti hain.</p>
<pre class="code">R1# show running-config          <span class="c">! abhi kya active hai (RAM)</span>
R1# show startup-config          <span class="c">! agle boot par kya load hoga (NVRAM)</span>
R1# copy running-config startup-config
Destination filename [startup-config]?    <span class="c">! accept karne ke liye Enter dabao</span>
Building configuration...
[OK]
R1# write memory                 <span class="c">! purani command, same result</span></pre>
<p><code>copy running-config startup-config</code> (<code>copy run start</code>) official command hai; <code>write memory</code> (<code>wr</code>) purani hai aur IOS par abhi bhi chalti hai. <code>copy</code> command hamesha <b>copy source destination</b> padhi jaati hai, jisse direction yaad rakhne mein madad milti hai.</p>

<h3>Undo aur erase karna</h3>
<ul>
<li>Ek command undo karne ke liye use aage <code>no</code> laga kar dobara likho: <code>no ip domain-lookup</code> ne lookups band kiye, <code>ip domain-lookup</code> unhe wapas chalu karta hai; <code>no description</code> description hata deta hai.</li>
<li>Saare unsaved changes phenkne ke liye bina save kiye <code>reload</code> karo: IOS poochta hai "System configuration has been modified. Save? [yes/no]" aur aap <b>no</b> bolte ho. Device purani startup-config se boot hota hai.</li>
<li>Device ko factory state mein wapas le jaane ke liye: <code>erase startup-config</code> (ya <code>write erase</code>), phir <code>reload</code>. Switch par VLANs hatane ke liye aap <code>flash:vlan.dat</code> bhi delete karte ho, jo aap VLAN module mein dekhoge.</li>
<li><code>copy startup-config running-config</code> saved configuration ko current wali mein <b>merge</b> karta hai; use replace nahi karta. Yeh bahut logon ko hairaan karta hai.</li>
</ul>

<h3>show version padhna</h3>
<p><code>show version</code> user EXEC mein chalta hai aur kai engineers anjaan device par sabse pehle yahi chalate hain. Yeh ek real ISR router ka output hai:</p>
<pre class="out"><span class="hl">Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.7(3)M8, RELEASE SOFTWARE (fc2)</span>
ROM: System Bootstrap, Version 15.0(1r)M16, RELEASE SOFTWARE (fc1)
<span class="hl">R1 uptime is 3 weeks, 2 days, 4 hours, 11 minutes</span>
System returned to ROM by power-on
<span class="hl">System image file is "flash0:c2900-universalk9-mz.SPA.157-3.M8.bin"</span>
Cisco CISCO2911/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FTX1840AHK2
3 Gigabit Ethernet interfaces
255K bytes of non-volatile configuration memory.
250880K bytes of ATA System CompactFlash 0 (Read/Write)
<span class="hl">Configuration register is 0x2102</span></pre>
<p>Isse aapko pata chalta hai: IOS version (15.7(3)M8), pichhle reload ko kitna time hua aur kyun ("power-on" ya "reload" ya crash), flash mein image file ka naam, hardware model aur serial, interfaces ki ginti, NVRAM aur flash ka size, aur <b>configuration register</b>. 0x2102 normal value hai: flash se IOS boot karo aur startup-config load karo. Lab simulator mein text chhota hai aur image ka naam alag hai, lekin wahi fields maujood hain.</p>

<div class="eg"><p><b>Worked example.</b> Aap tees minute R1 configure karte ho aur <code>show startup-config</code> chalate ho. Yeh kehta hai <code>startup-config is not present</code>. Aapka kaam sirf RAM mein hai. Aap <code>copy run start</code> chalate ho, Enter dabate ho, <code>[OK]</code> dekhte ho, aur ab <code>show startup-config</code> <code>Using 1482 out of 262144 bytes</code> se shuru hota hai aur uske baad aapki configuration hai. Ab power cut se aapka kuch nahi jaayega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Save karna tha lekin <code>copy startup-config running-config</code> type kar diya (direction ulti hai aur kuch save nahi hota). Tooti hui experiment ko startup-config ke roop mein save kar dena. Yeh maanna ki <code>copy start run</code> clean rollback deta hai (yeh merge karta hai). Pair ke dusre device par save karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Running-config = RAM, startup-config = NVRAM, IOS image = flash, bootstrap/POST/ROMMON = ROM. Configuration changes turant lagu hote hain lekin save na karo to reload par kho jaate hain. <code>show version</code> configuration register dikhata hai; 0x2102 normal boot value hai. <code>erase startup-config</code> plus <code>reload</code> router ko defaults par le aata hai.</p></div>

<div class="scn"><h4>Somvaar subah ka rahasya</h4><p>Shukravar ko ek engineer ne WAN router par naya branch subnet aur static route add kiya aur successfully test kiya. Weekend mein power maintenance ne building reboot kar di. Somvaar ko branch unreachable thi. <code>show version</code> ne "System returned to ROM by power-on" aur 1 din ka uptime dikhaya; <code>show running-config</code> mein Shukravar ke kaam ka koi nishaan nahi tha. Kuch save hi nahi hua tha. Change ticket notes se dobara lagaya gaya aur <code>copy run start</code> se save kiya gaya, aur team ne apni change checklist mein "save karo aur startup-config verify karo" jod diya.</p><p><b>Seekh:</b> change tab tak khatam nahi hota jab tak save na ho. Kisi unexplained outage ke baad <code>show version</code> ka uptime aapka pehla clue hai.</p></div>

<div class="iv"><p class="q">"Running-config aur startup-config mein kya farak hai?"</p><p>Strong answer: running-config RAM mein rehti hai aur device abhi wahi use kar raha hai; har configuration command use turant badalti hai. Startup-config NVRAM mein rehti hai aur boot par load hoti hai. Changes reload par kho jaate hain jab tak aap <code>copy running-config startup-config</code> (ya <code>write memory</code>) na chalao. Yeh bhi bolo ki <code>copy start run</code> replace nahi, merge karta hai, aur unsaved changes pakadne ke liye dono ko compare kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ROM: POST aur bootstrap. Flash: IOS image. NVRAM: startup-config. RAM: running-config aur tables.</li>
<li>Configuration commands running-config ko turant badalti hain; kuch bhi automatically save nahi hota.</li>
<li><code>copy running-config startup-config</code> ya <code>write memory</code> se save karo; copy hamesha source phir destination.</li>
<li><code>show version</code> IOS version, uptime, reload reason, image file aur configuration register (0x2102) dikhata hai.</li>
<li><code>no</code> se undo karo; <code>erase startup-config</code> aur <code>reload</code> se factory-reset karo.</li>
</ul></div>
`}};export{e as default};