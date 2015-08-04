<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" indent="no"/>
    <xsl:variable name="combined" select="'C:/Users/Caleth/AppData/Roaming/CBLoader/combined.dnd40'"/>
    <xsl:variable name="main" select="document('C:/Users/Caleth/AppData/Roaming/CBLoader/combined.dnd40')//RulesElement"/>

    <xsl:template name="string-replace-all">
        <xsl:param name="text" />
        <xsl:param name="replace" />
        <xsl:param name="by" />
        <xsl:choose>
            <xsl:when test="contains($text, $replace)">
                <xsl:value-of select="substring-before($text,$replace)" />
                <xsl:value-of select="$by" />
                <xsl:call-template name="string-replace-all">
                    <xsl:with-param name="text" select="substring-after($text,$replace)" disable-output-escaping="yes"/>
                    <xsl:with-param name="replace" select="$replace" />
                    <xsl:with-param name="by" select="$by" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$text" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="typeName">
        <xsl:variable name="charelem">
            <xsl:value-of select="@charelem"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="@type and @type!='Ability'">
                <xsl:value-of select="@type"/>
            </xsl:when>
            <xsl:when test="@abilmod">
                <xsl:value-of select="@statlink" disable-output-escaping="yes"/><xsl:text> modifier</xsl:text>
            </xsl:when>
            <xsl:when test="@statlink and @statlink!='_PER-LEVEL-HPS'">
                <xsl:value-of select="@statlink" disable-output-escaping="yes"/>
            </xsl:when>
            <xsl:when test="ancestor::CharacterSheet/LootTally//*[@charelem=$charelem]">
                <xsl:value-of select="ancestor::CharacterSheet/LootTally//*[@charelem=$charelem]/@name"/>
            </xsl:when>
            <xsl:when test="ancestor::CharacterSheet/RulesElementTally/*[@charelem=$charelem and @type!='Level' and substring(@name,1,1)!='_']">
                <xsl:value-of select="ancestor::CharacterSheet/RulesElementTally/*[@charelem=$charelem]/@name"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>Level </xsl:text>
                <xsl:value-of select="@Level"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="meetsRequires">
        <xsl:variable name="typeName">
            <xsl:call-template name="typeName"/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="substring(@requires,1,1)='!'">
                <xsl:variable name="require" select="substring(@requires,2)"/>
                <xsl:value-of select="count(ancestor::CharacterSheet/RulesElementTally/*[@name=$require])=0"/>
            </xsl:when>
            <xsl:when test="@requires">
                <xsl:variable name="require" select="@requires"/>
                <xsl:value-of select="count(ancestor::CharacterSheet/RulesElementTally/*[@name=$require])!=0"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$typeName!='Defensive'"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="comma">
        <xsl:if test="position()!=last()">
            <xsl:text>,&#xA;</xsl:text>
        </xsl:if>   
    </xsl:template>
    
    <xsl:template match="statadd">
        <xsl:variable name="typeName">
            <xsl:call-template name="typeName"/>
        </xsl:variable>
        <xsl:variable name="meetsRequires">
            <xsl:call-template name="meetsRequires"/>
        </xsl:variable>
        <xsl:if test="$meetsRequires='true'">
            <xsl:text>,"</xsl:text>
            <xsl:value-of select="$typeName"/>
            <xsl:text>": </xsl:text>
            <xsl:choose>
                <xsl:when test="not(@statlink)">
                    <xsl:value-of select="@value"/>
                </xsl:when>
                <xsl:when test="not(@abilmod)">
                    <xsl:variable name="name" select="@statlink"/>
                    <xsl:value-of select="ancestor::StatBlock/*[alias/@name=$name]/@value"/>
                </xsl:when>
                <xsl:when test="@abilmod">
                    <xsl:variable name="name"><xsl:value-of select="@statlink"/> modifier</xsl:variable>
                    <xsl:value-of select="ancestor::StatBlock/*[alias/@name=$name]/@value"/>
                </xsl:when>
            </xsl:choose>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="specific">
        <xsl:param name="name" select="@name"/>
        <xsl:param name="comma">
            <xsl:call-template name="comma"/>
        </xsl:param>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$name"/>
        <xsl:text>": "</xsl:text>
        <xsl:value-of select="normalize-space(text())" disable-output-escaping="yes"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$comma"/>
    </xsl:template>
    
    <xsl:template match="RulesElement/text()">
        <xsl:param name="name">Text</xsl:param>
        <xsl:param name="comma">
            <xsl:call-template name="comma"/>
        </xsl:param>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$name"/>
        <xsl:text>": "</xsl:text>
        <xsl:value-of select="normalize-space(.)" disable-output-escaping="yes"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$comma"/>
    </xsl:template>
    
    <xsl:template match="specific[@name='Level' and parent::RulesElement[@type='Magic Item']]">
        <xsl:param name="name" select="'Enhancement'"/>
        <xsl:param name="comma">
            <xsl:call-template name="comma"/>
        </xsl:param>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$name"/>
        <xsl:text>": "</xsl:text>
        <xsl:value-of select="ceiling(text() div 5)" disable-output-escaping="yes"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$comma"/>
    </xsl:template>
    
    <xsl:template match="Details/* | Weapon/* | Flavor">
        <xsl:param name="comma">
            <xsl:call-template name="comma"/>
        </xsl:param>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="name()"/>
        <xsl:text>": "</xsl:text>
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="normalize-space(text())" disable-output-escaping="yes"/>
            <xsl:with-param name="replace">&quot;</xsl:with-param>
            <xsl:with-param name="by">&apos;&apos;</xsl:with-param>
        </xsl:call-template>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="$comma"/>
    </xsl:template>

    <xsl:template match="alias[position()=1 and not(following-sibling::statadd[@type or @statlink or @String])]">
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": </xsl:text>
        <xsl:value-of select="../@value"/>
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="alias[position()=1 and following-sibling::statadd[@type or @statlink]]">
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": {"Total": </xsl:text>
        <xsl:value-of select="../@value"/>
        <xsl:apply-templates select="../statadd[not(@conditional)]"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="alias[position()=1 and following-sibling::statadd[@String]]">
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": "</xsl:text>
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="../statadd/@String"/>
            <xsl:with-param name="replace">&quot;</xsl:with-param>
            <xsl:with-param name="by">&apos;&apos;</xsl:with-param>
        </xsl:call-template>
        <xsl:text>"</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="RulesElement[ancestor::RulesElementTally]">
        <xsl:text>"</xsl:text>
        <xsl:value-of select="position()"/>
        <xsl:text>":{"type" : "</xsl:text>
        <xsl:call-template name="typeName"/>
        <xsl:text>", &#xA;"name" : "</xsl:text>       
        <xsl:value-of select="@name"/>
        <xsl:text>"</xsl:text>
        <xsl:if test="specific[@name='Short Description' or @name='Flavor']">,&#xA;</xsl:if>
        <xsl:apply-templates select="specific[@name='Short Description' or @name='Flavor']"/>
        <xsl:text>}</xsl:text>        
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="loot[@count>0 and count(RulesElement)>1]">
        <xsl:text>"</xsl:text>
        <xsl:call-template name="string-replace-all">
            <xsl:with-param name="text" select="RulesElement[@type='Magic Item']/@name"/>
            <xsl:with-param name="replace" select="RulesElement[@type!='Magic Item']/@type"/>
            <xsl:with-param name="by" select="RulesElement[@type!='Magic Item']/@name"/>
        </xsl:call-template>
        <xsl:text>": {</xsl:text>
        <xsl:apply-templates select="RulesElement" mode="Loot"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>
    
    <xsl:template match="loot[@count>0 and count(RulesElement)=1]">
        <xsl:apply-templates select="RulesElement" mode="Loot"/>
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="RulesElement[ancestor::LootTally]" mode="Loot">
        <xsl:variable name="internal-id" select="@internal-id"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": {"type" : "</xsl:text>
        <xsl:value-of select="@type"/>
        <xsl:text>", "count" : "</xsl:text>
        <xsl:value-of select="ancestor::loot/@count"/>
        <xsl:text>", "equip" : "</xsl:text>
        <xsl:value-of select="ancestor::loot/@equip-count"/>
        <xsl:text>"</xsl:text>
        <xsl:if test="$main[@internal-id=$internal-id]/specific[substring(@name,1,1)!='_' and @name!='count' and @name!='type' and @name!='Full Text' and normalize-space(text())!='']">,&#xA;</xsl:if>
        <xsl:apply-templates select="$main[@internal-id=$internal-id]/specific[substring(@name,1,1)!='_' and @name!='count' and @name!='type' and @name!='Full Text' and normalize-space(text())!=''] | $main[@internal-id=$internal-id]/text()[normalize-space(.)!='']"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>
    
    <xsl:template match="RulesElement[ancestor::LootTally]" mode="ItemPower">
        <xsl:variable name="internal-id" select="@internal-id"/>
        <xsl:apply-templates select="$main[@internal-id=$internal-id]/specific[@name='Power' and normalize-space(text())!='']">
            <xsl:with-param name="name" select="@name"/>
            <xsl:with-param name="comma">
                <xsl:call-template name="comma"/>
            </xsl:with-param>
        </xsl:apply-templates>
    </xsl:template>
    
    <xsl:template match="Power[@name=document('C:/Users/Caleth/AppData/Roaming/CBLoader/combined.dnd40')//RulesElement[@type='Power' and not(specific[@name='_AugmentVersions'])]/@name]">
        <xsl:variable name="name" select="@name"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": {</xsl:text>
        <xsl:apply-templates select="$main[@name=$name and @type='Power']/specific[substring(@name,1,1)!='_' and normalize-space(text())!=''] | $main[@name=$name and @type='Power']/Flavor"/>
        <xsl:if test="count(./Weapon)>0">
            <xsl:text>,&#xA;"Weapons": {</xsl:text>
            <xsl:apply-templates select="Weapon[not(@name='Unarmed') or (count(preceding-sibling::Weapon)=0 and count(following-sibling::Weapon)=0)]"/>
            <xsl:text>}</xsl:text>
        </xsl:if>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>

    <xsl:template match="Power[@name=document('C:/Users/Caleth/AppData/Roaming/CBLoader/combined.dnd40')//RulesElement[@type='Power' and specific[@name='_AugmentVersions']]/@name]">
        <xsl:variable name="name" select="@name"/>
        <xsl:variable name="parent-id" select="$main[@name=$name and @type='Power']/@internal-id"/>
        <xsl:apply-templates select="$main[@type='Power' and normalize-space(specific[@name='_AugmentParent']/text())=$parent-id]">
            <xsl:with-param name="Weapon">
                <xsl:apply-templates select="Weapon[not(@name='Unarmed') or (count(preceding-sibling::Weapon)=0 and count(following-sibling::Weapon)=0)]"/>
            </xsl:with-param>
        </xsl:apply-templates>
        <xsl:call-template name="comma"/>
    </xsl:template>
    
    <xsl:template match="RulesElement[@type='Power']">
        <xsl:param name="Weapon"/>
        <xsl:variable name="name" select="@name"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": {</xsl:text>
        <xsl:apply-templates select="Flavor | specific[substring(@name,1,1)!='_' and normalize-space(text())!='']"/>
        <xsl:if test="$Weapon!=''">
            <xsl:text>,&#xA;"Weapons": {</xsl:text>
            <xsl:value-of select="$Weapon"/>
            <xsl:text>}</xsl:text>
        </xsl:if>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>
    
    <xsl:template match="Weapon">
        <xsl:variable name="internal-id" select="RulesElement[@type='Magic Item']/@internal-id"/>
        <xsl:text>"</xsl:text>
        <xsl:value-of select="@name"/>
        <xsl:text>": {</xsl:text>
        <xsl:apply-templates select="*[normalize-space(text())!=''] | $main[@internal-id=$internal-id]/specific[@name='Critical' or @name='Property' or @name='Level']"/>
        <xsl:text>}</xsl:text>
        <xsl:call-template name="comma"/>
    </xsl:template>
    
    <xsl:template match="D20Character/CharacterSheet">
        <xsl:text>{&#xA;"Vitals": {&#xA;</xsl:text>
        <xsl:apply-templates select="Details/*[not(self::Portrait) and normalize-space(text())!='']"/>
        <xsl:text>},&#xA;"StatBlock": {&#xA;</xsl:text>
        <xsl:apply-templates select="StatBlock/*[@value!=0 or child::statadd/@String]/alias[1]"/>
        <xsl:text>},&#xA;"RulesElements": {&#xA;</xsl:text>
        <xsl:apply-templates select="RulesElementTally/*[@type!='Proficiency' and @type!='Skill' and @type!='Level' and @type!='Level1Rules']">
            <xsl:sort select="@type"/>
        </xsl:apply-templates>
        <xsl:text>},&#xA;"Loot" : {&#xA;</xsl:text>
        <xsl:apply-templates select="LootTally/*[@count>0]"/>
        <xsl:text>},&#xA;"Powers": {&#xA;</xsl:text>
        <xsl:apply-templates select="PowerStats/Power"/>
        <xsl:text>},&#xA;"Item Powers": {&#xA;</xsl:text>
        <xsl:apply-templates select="LootTally/*[@count>0]/RulesElement[$main[specific[@name='Power' and normalize-space(text())!='']]/@internal-id=@internal-id]" mode="ItemPower"/>
        <xsl:text>}}</xsl:text>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="D20Character/CharacterSheet" />
    </xsl:template>
</xsl:stylesheet>