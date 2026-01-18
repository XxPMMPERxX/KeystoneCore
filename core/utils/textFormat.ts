/* eslint-disable no-control-regex */
export class TextFormat {
  public static readonly ESCAPE = '\u00a7'; // §
  public static readonly EOL = '\n';

  public static readonly BLACK = TextFormat.ESCAPE + '0';
  public static readonly DARK_BLUE = TextFormat.ESCAPE + '1';
  public static readonly DARK_GREEN = TextFormat.ESCAPE + '2';
  public static readonly DARK_AQUA = TextFormat.ESCAPE + '3';
  public static readonly DARK_RED = TextFormat.ESCAPE + '4';
  public static readonly DARK_PURPLE = TextFormat.ESCAPE + '5';
  public static readonly GOLD = TextFormat.ESCAPE + '6';
  public static readonly GRAY = TextFormat.ESCAPE + '7';
  public static readonly DARK_GRAY = TextFormat.ESCAPE + '8';
  public static readonly BLUE = TextFormat.ESCAPE + '9';
  public static readonly GREEN = TextFormat.ESCAPE + 'a';
  public static readonly AQUA = TextFormat.ESCAPE + 'b';
  public static readonly RED = TextFormat.ESCAPE + 'c';
  public static readonly LIGHT_PURPLE = TextFormat.ESCAPE + 'd';
  public static readonly YELLOW = TextFormat.ESCAPE + 'e';
  public static readonly WHITE = TextFormat.ESCAPE + 'f';

  public static readonly MINECOIN_GOLD = TextFormat.ESCAPE + 'g';
  public static readonly MATERIAL_QUARTZ = TextFormat.ESCAPE + 'h';
  public static readonly MATERIAL_IRON = TextFormat.ESCAPE + 'i';
  public static readonly MATERIAL_NETHERITE = TextFormat.ESCAPE + 'j';
  public static readonly MATERIAL_REDSTONE = TextFormat.ESCAPE + 'm';
  public static readonly MATERIAL_COPPER = TextFormat.ESCAPE + 'n';
  public static readonly MATERIAL_GOLD = TextFormat.ESCAPE + 'p';
  public static readonly MATERIAL_EMERALD = TextFormat.ESCAPE + 'q';
  public static readonly MATERIAL_DIAMOND = TextFormat.ESCAPE + 's';
  public static readonly MATERIAL_LAPIS = TextFormat.ESCAPE + 't';
  public static readonly MATERIAL_AMETHYST = TextFormat.ESCAPE + 'u';
  public static readonly MATERIAL_RESIN = TextFormat.ESCAPE + 'v';

  public static readonly COLORS: Readonly<Record<string, string>> = {
    [TextFormat.BLACK]: TextFormat.BLACK,
    [TextFormat.DARK_BLUE]: TextFormat.DARK_BLUE,
    [TextFormat.DARK_GREEN]: TextFormat.DARK_GREEN,
    [TextFormat.DARK_AQUA]: TextFormat.DARK_AQUA,
    [TextFormat.DARK_RED]: TextFormat.DARK_RED,
    [TextFormat.DARK_PURPLE]: TextFormat.DARK_PURPLE,
    [TextFormat.GOLD]: TextFormat.GOLD,
    [TextFormat.GRAY]: TextFormat.GRAY,
    [TextFormat.DARK_GRAY]: TextFormat.DARK_GRAY,
    [TextFormat.BLUE]: TextFormat.BLUE,
    [TextFormat.GREEN]: TextFormat.GREEN,
    [TextFormat.AQUA]: TextFormat.AQUA,
    [TextFormat.RED]: TextFormat.RED,
    [TextFormat.LIGHT_PURPLE]: TextFormat.LIGHT_PURPLE,
    [TextFormat.YELLOW]: TextFormat.YELLOW,
    [TextFormat.WHITE]: TextFormat.WHITE,
    [TextFormat.MINECOIN_GOLD]: TextFormat.MINECOIN_GOLD,
    [TextFormat.MATERIAL_QUARTZ]: TextFormat.MATERIAL_QUARTZ,
    [TextFormat.MATERIAL_IRON]: TextFormat.MATERIAL_IRON,
    [TextFormat.MATERIAL_NETHERITE]: TextFormat.MATERIAL_NETHERITE,
    [TextFormat.MATERIAL_REDSTONE]: TextFormat.MATERIAL_REDSTONE,
    [TextFormat.MATERIAL_COPPER]: TextFormat.MATERIAL_COPPER,
    [TextFormat.MATERIAL_GOLD]: TextFormat.MATERIAL_GOLD,
    [TextFormat.MATERIAL_EMERALD]: TextFormat.MATERIAL_EMERALD,
    [TextFormat.MATERIAL_DIAMOND]: TextFormat.MATERIAL_DIAMOND,
    [TextFormat.MATERIAL_LAPIS]: TextFormat.MATERIAL_LAPIS,
    [TextFormat.MATERIAL_AMETHYST]: TextFormat.MATERIAL_AMETHYST,
    [TextFormat.MATERIAL_RESIN]: TextFormat.MATERIAL_RESIN
  };

  public static readonly OBFUSCATED = TextFormat.ESCAPE + 'k';
  public static readonly BOLD = TextFormat.ESCAPE + 'l';
  public static readonly ITALIC = TextFormat.ESCAPE + 'o';

  public static readonly FORMATS: Readonly<Record<string, string>> = {
    [TextFormat.OBFUSCATED]: TextFormat.OBFUSCATED,
    [TextFormat.BOLD]: TextFormat.BOLD,
    [TextFormat.ITALIC]: TextFormat.ITALIC
  };

  public static readonly RESET = TextFormat.ESCAPE + 'r';

  public static tokenize(input: string): string[] {
    const regex = new RegExp(`(${TextFormat.ESCAPE}[0-9a-v])`, 'gu');
    return input.split(regex).filter(v => v.length > 0);
  }

  public static clean(input: string): string {
    return input
      .replace(/\u00a7[0-9a-vk-or]/giu, '')

      .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
      .replace(/\x1b/g, '')

      .replace(/[\uE000-\uF8FF]/gu, '');
  }

  public static colorize(input: string, placeholder: string = '&'): string {
    const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return input.replace(
      new RegExp(`${escaped}([0-9a-vk-or])`, 'gi'),
      TextFormat.ESCAPE + '$1'
    );
  }

  public static addBase(baseFormat: string, input: string): string {
    for (const part of TextFormat.tokenize(baseFormat)) {
      if (!(part in TextFormat.COLORS) && !(part in TextFormat.FORMATS)) {
        throw new Error(`Unexpected base format token '${part}'`);
      }
    }

    const base = TextFormat.RESET + baseFormat;
    return base + input.replace(TextFormat.RESET, base);
  }

  /**
   * Converts Java formatting to Bedrock-compatible formatting
   */
  public static javaToBedrock(input: string): string {
    return input
      .replace(TextFormat.ESCAPE + 'm', '')
      .replace(TextFormat.ESCAPE + 'n', '');
  }

  /**
   * Converts Minecraft formatting to HTML
   */
  public static toHTML(input: string): string {
    let output = '';
    let openSpans = 0;

    for (const token of TextFormat.tokenize(input)) {
      let style: string | null = null;

      switch (token) {
        case TextFormat.BLACK: style = 'color:#000'; break;
        case TextFormat.DARK_BLUE: style = 'color:#00A'; break;
        case TextFormat.DARK_GREEN: style = 'color:#0A0'; break;
        case TextFormat.DARK_AQUA: style = 'color:#0AA'; break;
        case TextFormat.DARK_RED: style = 'color:#A00'; break;
        case TextFormat.DARK_PURPLE: style = 'color:#A0A'; break;
        case TextFormat.GOLD: style = 'color:#FA0'; break;
        case TextFormat.GRAY: style = 'color:#AAA'; break;
        case TextFormat.DARK_GRAY: style = 'color:#555'; break;
        case TextFormat.BLUE: style = 'color:#55F'; break;
        case TextFormat.GREEN: style = 'color:#5F5'; break;
        case TextFormat.AQUA: style = 'color:#5FF'; break;
        case TextFormat.RED: style = 'color:#F55'; break;
        case TextFormat.LIGHT_PURPLE: style = 'color:#F5F'; break;
        case TextFormat.YELLOW: style = 'color:#FF5'; break;
        case TextFormat.WHITE: style = 'color:#FFF'; break;

        case TextFormat.BOLD: style = 'font-weight:bold'; break;
        case TextFormat.ITALIC: style = 'font-style:italic'; break;
      }

      if (style !== null) {
        output += `<span style='${style}'>`;
        openSpans++;
      } else if (token === TextFormat.RESET) {
        output += '</span>'.repeat(openSpans);
        openSpans = 0;
      } else {
        output += token;
      }
    }

    return output + '</span>'.repeat(openSpans);
  }
}
