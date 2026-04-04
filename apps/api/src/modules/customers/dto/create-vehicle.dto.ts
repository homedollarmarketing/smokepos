import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID, Min, Max, MaxLength } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 2)
    year: number;

    @IsUUID()
    @IsOptional()
    brandId?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    color?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    numberPlate?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    vinNumber?: string;
}
